"""Собирает локальные акты на официальном бланке: HTML → DOCX → PDF.

Исходники — documents-src/*.html (простая разметка: h1, h2, p, ul/li, table,
блок .approve). Каждый документ кладётся в тело бланка documents-src/blank.docx,
затем LibreOffice делает PDF. В PDF шрифт встроен с таблицей символов, текст
ищется и копируется (п. 24 приказа Рособрнадзора № 1493).

Дата и номер приказа об утверждении — в documents-src/order.json.

Запуск:
  python3 -P scripts/build-local-acts.py [папка-для-docx-и-приказа]

PDF актов → public/documents/. DOCX всех документов и PDF проекта приказа
(prikaz_utverzhdenie, на сайт не выкладывается) → папка из аргумента,
по умолчанию documents-src/out/.
"""
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'documents-src'
PUBLIC = ROOT / 'public' / 'documents'
PRIVATE = {'prikaz_utverzhdenie'}
FONT = 'Times New Roman'
MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
          'августа', 'сентября', 'октября', 'ноября', 'декабря']


# ─── Разбор HTML ─────────────────────────────────────────────────────────────

class Blocks(HTMLParser):
    """Плоский список блоков: (вид, классы, [(текст, жирный)]) и таблицы."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list = []
        self.cur = None
        self.bold = 0
        self.in_approve = False
        self.table = None
        self.row = None
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        cls = (dict(attrs).get('class') or '').split()
        if tag in ('head', 'style', 'script'):
            self.skip += 1
        elif tag == 'div' and 'approve' in cls:
            self.in_approve = True
        elif tag in ('p', 'h1', 'h2', 'li'):
            kind = 'approve' if self.in_approve and tag == 'p' else tag
            self.cur = (kind, cls, [])
        elif tag in ('b', 'strong', 'th'):
            self.bold += 1
        elif tag == 'br' and self.cur:
            self.cur[2].append(('\n', False))
        elif tag == 'table':
            self.table = []
        elif tag == 'tr':
            self.row = []
        if tag in ('td', 'th'):
            self.cur = ('cell', [], [])

    def handle_endtag(self, tag):
        if tag in ('head', 'style', 'script'):
            self.skip -= 1
        elif tag == 'div' and self.in_approve:
            self.in_approve = False
        elif tag in ('p', 'h1', 'h2', 'li') and self.cur:
            self.blocks.append(self.cur)
            self.cur = None
        elif tag in ('b', 'strong'):
            self.bold -= 1
        elif tag in ('td', 'th'):
            if tag == 'th':
                self.bold -= 1
            self.row.append(self.cur[2])
            self.cur = None
        elif tag == 'tr':
            self.table.append(self.row)
        elif tag == 'table':
            self.blocks.append(('table', [], self.table))
            self.table = None

    def handle_data(self, data):
        if self.skip or self.cur is None:
            return
        text = ' '.join(data.split())
        if data[:1].isspace() and text:
            text = ' ' + text
        if data[-1:].isspace() and text:
            text += ' '
        if text:
            self.cur[2].append((text, self.bold > 0))


# ─── Сборка DOCX ─────────────────────────────────────────────────────────────

def runs(par, parts, size=12, bold=None):
    first = True
    for text, b in parts:
        if text == '\n':
            par.add_run().add_break()
            first = True
            continue
        if first:
            text = text.lstrip()
            first = False
        r = par.add_run(text.replace(' ', ' ') if text.strip('  ') == '' else text)
        r.font.name = FONT
        r._element.rPr.rFonts.set(qn('w:cs'), FONT)
        r.font.size = Pt(size)
        r.bold = bold if bold is not None else b
    # хвостовой пробел у последнего куска не нужен
    if par.runs:
        par.runs[-1].text = par.runs[-1].text.rstrip()


def fmt(par, *, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first=0.0, left=0.0, before=0, after=3, keep=False):
    pf = par.paragraph_format
    pf.alignment = align
    pf.first_line_indent = Cm(first) if first else None
    pf.left_indent = Cm(left) if left else None
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = 1.15
    pf.keep_with_next = keep


def tabbed(par, parts, stops):
    """Строка с позициями по табуляции: «дата | город | номер»."""
    text = ''.join(t for t, _ in parts).strip()
    for pos, kind in stops:
        par.paragraph_format.tab_stops.add_tab_stop(Cm(pos), kind)
    runs(par, [('\t'.join(s.strip() for s in text.split('|')), False)])


def table(doc, rows):
    t = doc.add_table(rows=len(rows), cols=len(rows[0]))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    borders = OxmlElement('w:tblBorders')
    for side in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{side}')
        e.set(qn('w:val'), 'single')
        e.set(qn('w:sz'), '4')
        e.set(qn('w:color'), '000000')
        borders.append(e)
    t._tbl.tblPr.append(borders)
    for i, row in enumerate(rows):
        for j, cell in enumerate(row):
            p = t.cell(i, j).paragraphs[0]
            fmt(p, align=WD_ALIGN_PARAGRAPH.LEFT, after=0)
            runs(p, cell, size=11)
    fmt(doc.add_paragraph(), after=0)


def page_setup(doc):
    """Бланк рассчитан на одну страницу: шапка у самого верха и почти нулевое
    нижнее поле. Для многостраничных актов: нижнее поле 2 см, со второй
    страницы — отступ сверху и номер страницы внизу."""
    s = doc.sections[0]
    s.bottom_margin = Cm(2)
    s.footer_distance = Cm(1)
    s.header_distance = Cm(0.75)
    s.different_first_page_header_footer = True
    hp = s.header.paragraphs[0]
    hp.paragraph_format.space_after = Pt(28)
    fp = s.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = fp.add_run()
    for kind, text in (('begin', None), (None, 'PAGE'), ('end', None)):
        if kind:
            e = OxmlElement('w:fldChar')
            e.set(qn('w:fldCharType'), kind)
        else:
            e = OxmlElement('w:instrText')
            e.set(qn('xml:space'), 'preserve')
            e.text = text
        run._r.append(e)
    run.font.name = FONT
    run.font.size = Pt(10)


def build_docx(html: Path, out: Path, subst: dict) -> None:
    text = html.read_text(encoding='utf-8')
    for k, v in subst.items():
        text = text.replace('{{' + k + '}}', v)
    parser = Blocks()
    parser.feed(text)

    doc = Document(str(SRC / 'blank.docx'))
    body = doc.element.body
    # в бланке после шапки два пустых абзаца — оставляем один как отступ
    paras = doc.paragraphs
    for p in paras[10:]:
        body.remove(p._element)
    page_setup(doc)

    approve_started = False
    for kind, cls, parts in parser.blocks:
        if kind == 'table':
            table(doc, parts)
            continue
        if 'org' in cls:
            continue  # название организации уже есть в шапке бланка
        plain = ''.join(t for t, _ in parts).strip('  ')
        p = doc.add_paragraph()
        if kind == 'approve':
            fmt(p, align=WD_ALIGN_PARAGRAPH.LEFT, left=9.5, before=0 if approve_started else 12, after=0)
            approve_started = True
            runs(p, parts)
        elif kind == 'h1':
            fmt(p, align=WD_ALIGN_PARAGRAPH.CENTER, before=18, after=4, keep=True)
            runs(p, [(t.upper(), b) for t, b in parts], size=13, bold=True)
        elif kind == 'h2':
            fmt(p, align=WD_ALIGN_PARAGRAPH.CENTER, before=10, after=4, keep=True)
            runs(p, parts, bold=True)
        elif kind == 'li':
            fmt(p, first=-0.5, left=1.75)
            runs(p, [('– ', False)] + parts)
        elif 'sub' in cls:
            fmt(p, align=WD_ALIGN_PARAGRAPH.CENTER, after=12)
            if plain:
                runs(p, parts, bold=True)
        elif 'dateline' in cls:
            fmt(p, align=WD_ALIGN_PARAGRAPH.LEFT, before=6, after=12)
            tabbed(p, parts, [(8.0, WD_TAB_ALIGNMENT.CENTER), (16.5, WD_TAB_ALIGNMENT.RIGHT)])
        elif 'sign' in cls:
            fmt(p, align=WD_ALIGN_PARAGRAPH.LEFT, before=24)
            tabbed(p, parts, [(16.5, WD_TAB_ALIGNMENT.RIGHT)])
        else:
            fmt(p, first=0 if 'ni' in cls else 1.25)
            if plain:
                runs(p, parts)
    doc.save(str(out))


def to_pdf(docx: Path, out_dir: Path) -> Path:
    with tempfile.TemporaryDirectory() as profile:
        subprocess.run(
            ['soffice', f'-env:UserInstallation=file://{profile}', '--headless',
             '--convert-to', 'pdf', '--outdir', str(out_dir), str(docx)],
            check=True, capture_output=True, timeout=180,
        )
    return out_dir / f'{docx.stem}.pdf'


def order_subst() -> dict:
    o = json.loads((SRC / 'order.json').read_text(encoding='utf-8'))
    d = date.fromisoformat(o['date']) if o.get('date') else None
    no = o.get('number') or '_____'
    blank = '«___»________________ 20____ г.'
    short = f'{d:%d.%m.%Y}' if d else blank
    long = f'«{d.day:02d}» {MONTHS[d.month - 1]} {d.year} г.' if d else blank
    return {'ORDER': f'от {short} № {no}', 'ORDER_DATE_LONG': long, 'ORDER_NO': no}


def main() -> None:
    work = Path(sys.argv[1]) if len(sys.argv) > 1 else SRC / 'out'
    work.mkdir(parents=True, exist_ok=True)
    subst = order_subst()
    for html in sorted(SRC.glob('*.html')):
        docx = work / f'{html.stem}.docx'
        build_docx(html, docx, subst)
        pdf = to_pdf(docx, work)
        if html.stem not in PRIVATE:
            dest = PUBLIC / pdf.name
            shutil.copyfile(pdf, dest)
            pdf.unlink()
            pdf = dest
        print(f'{html.stem:24} {pdf.stat().st_size // 1024:4} КБ  {pdf}')


if __name__ == '__main__':
    main()
