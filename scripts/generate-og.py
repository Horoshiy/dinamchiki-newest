"""
Обложки для мессенджеров и соцсетей.

Старые были сгенерированы с чужим доменом (dynamost.ru), возрастом «4–14»
и заголовком, который перекрывался декоративным кругом. Рисуем заново:
настоящий логотип клуба, свой домен, актуальные цифры.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BRAND = (30, 80, 216)
DARK  = (16, 44, 122)
FONTS = '/home/clawd/dinamchiki-app/node_modules/@expo-google-fonts/manrope'
BOLD  = f'{FONTS}/800ExtraBold/Manrope_800ExtraBold.ttf'
SEMI  = f'{FONTS}/600SemiBold/Manrope_600SemiBold.ttf'
LOGO  = '/home/clawd/dinamchiki-newest/public/logo/dinamchiki-white-512.png'
OUT   = '/home/clawd/dinamchiki-newest/public/og'

CARDS = {
    'dinamchiki-cover':      ('Детский футбольный клуб', '«Динамчики»',  'Тренировки для детей 3–14 лет в Ставрополе'),
    'dinamchiki-teams':      ('Возрастные группы',       'Команды',      '17 групп на трёх площадках города'),
    'dinamchiki-coaches':    ('Тренерский состав',       'Тренеры',      'Пять тренеров-преподавателей клуба'),
    'dinamchiki-tournaments':('Соревнования',            'Турниры',      'Матчи, таблицы и результаты клуба'),
    'dinamchiki-gallery':    ('Атмосфера',               'Галерея',      'Тренировки, матчи и праздники клуба'),
    'dinamchiki-contacts':   ('Как нас найти',           'Контакты',     'Три площадки в Ставрополе, запись на пробную'),
}

def gradient(w, h, top, bottom):
    base = Image.new('RGB', (1, h))
    px = base.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        px[0, y] = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    return base.resize((w, h))

logo_src = Image.open(LOGO).convert('RGBA')

for name, (eyebrow, title, subtitle) in CARDS.items():
    img = gradient(W, H, BRAND, DARK)
    d = ImageDraw.Draw(img, 'RGBA')

    # Мягкие круги на фоне — держим их справа, подальше от текста:
    # в старой обложке такой круг наезжал на заголовок.
    d.ellipse((W - 250, -140, W + 190, 300), fill=(255, 255, 255, 20))
    d.ellipse((W - 120, H - 190, W + 240, H + 170), fill=(255, 255, 255, 14))

    logo = logo_src.resize((132, 132), Image.LANCZOS)
    img.paste(logo, (80, 74), logo)

    f_eyebrow = ImageFont.truetype(SEMI, 30)
    f_title   = ImageFont.truetype(BOLD, 92)
    f_sub     = ImageFont.truetype(SEMI, 34)
    f_domain  = ImageFont.truetype(SEMI, 26)

    d.text((80, 268), eyebrow.upper(), font=f_eyebrow, fill=(255, 255, 255, 190))
    d.text((80, 312), title,           font=f_title,   fill=(255, 255, 255, 255))
    d.text((80, 432), subtitle,        font=f_sub,     fill=(255, 255, 255, 205))
    d.line((80, 512, 152, 512), fill=(255, 255, 255, 150), width=5)
    d.text((80, 540), 'dinamchiki.ru', font=f_domain,  fill=(255, 255, 255, 165))

    # Заголовок не должен выходить за поля — обложку никто не проверяет глазами.
    right = d.textbbox((80, 312), title, font=f_title)[2]
    assert right < W - 260, f'{name}: заголовок шире поля ({right}px)'

    img.save(f'{OUT}/{name}.png', optimize=True)
    print(f'{name}.png — заголовок до {right}px')
