import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import AgentCodeInput from '@/features/base/components/AgentCodeInput.vue'

// Обёртка с настоящим v-model — как в экране входа.
const Harness = defineComponent({
  components: { AgentCodeInput },
  data: () => ({ code: '' }),
  render() {
    return h(AgentCodeInput, {
      modelValue: this.code,
      'onUpdate:modelValue': (v: string) => {
        this.code = v
      },
    })
  },
})

function caret(w: ReturnType<typeof mount>): number {
  return (w.find('input').element as HTMLInputElement).selectionStart ?? -1
}

// Печатаем символ по каретке — так же, как это делает браузер.
async function typeChar(w: ReturnType<typeof mount>, ch: string) {
  const input = w.find('input')
  const el = input.element as HTMLInputElement
  const pos = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? pos
  el.value = el.value.slice(0, pos) + ch + el.value.slice(end)
  el.setSelectionRange(pos + ch.length, pos + ch.length)
  await input.trigger('input')
}

describe('поле ввода кода игрока', () => {
  it('кириллица не попадает в значение и в модель', async () => {
    const w = mount(Harness)
    const input = w.find('input')
    await input.setValue('Ф2AW5')
    expect((input.element as HTMLInputElement).value).toBe('2AW5-')
    expect(w.vm.code).toBe('2AW5')
  })

  it('про кириллицу в поле сказано прямо', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('Ф2AW5')
    expect(w.find('.code-input__warn').text()).toContain('раскладку')
    expect(w.find('.code-input__hint').exists()).toBe(false)
  })

  it('предупреждение не гаснет, пока вводят дальше', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('Ф')
    expect(w.find('.code-input__warn').exists()).toBe(true)
    await w.find('input').setValue('Ф2')
    expect(w.find('.code-input__warn').exists()).toBe(true)
  })

  it('после очистки поля предупреждение снимается', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('Ф2')
    await w.find('input').setValue('')
    expect(w.find('.code-input__warn').exists()).toBe(false)
  })

  it('для чистого латинского ввода предупреждения нет', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('2aw583gtpv')
    expect(w.find('.code-input__warn').exists()).toBe(false)
    expect(w.find('.code-input__count').text()).toBe('10/10')
    expect((w.find('input').element as HTMLInputElement).value).toBe('2AW5-83GT-PV')
  })

  it('мобильная клавиатура просит латинскую раскладку', () => {
    const w = mount(Harness)
    const input = w.find('input')
    expect(input.attributes('inputmode')).toBe('latin')
    expect(input.attributes('lang')).toBe('en')
    expect(input.attributes('autocomplete')).toBe('off')
  })

  it('после четвёртой буквы каретка встаёт за дефис', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('2AW5')
    expect((w.find('input').element as HTMLInputElement).value).toBe('2AW5-')
    expect(caret(w)).toBe(5)
  })

  it('после восьмой буквы каретка снова за дефисом', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('2AW583GT')
    expect((w.find('input').element as HTMLInputElement).value).toBe('2AW5-83GT-')
    expect(caret(w)).toBe(10)
  })

  it('тире на границе группы не съедает букву, а переводит каретку дальше', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('2AW5')
    // Пользователь вводит дефис там, где он и так стоит.
    await w.find('input').setValue('2AW5-')
    expect(w.vm.code).toBe('2AW5')
    expect((w.find('input').element as HTMLInputElement).value).toBe('2AW5-')
    expect(caret(w)).toBe(5)
  })

  it('каретка не уезжает в конец, если править код в середине', async () => {
    const w = mount(Harness)
    await w.find('input').setValue('2AW583GTPV')
    const el = w.find('input').element as HTMLInputElement
    expect(el.value).toBe('2AW5-83GT-PV')
    // Правка пятой буквы: вместо 8 игрок печатает X.
    el.value = '2AW5-X83GT-PV'
    el.setSelectionRange(6, 6)
    await w.find('input').trigger('input')
    expect(w.vm.code).toBe('2AW5X83GTP')
    expect(caret(w)).toBe(6)
  })

  it('строчные буквы не переставляют код', async () => {
    const w = mount(Harness)
    for (const ch of '9ne') await typeChar(w, ch)
    const el = w.find('input').element as HTMLInputElement
    expect(el.value).toBe('9NE')
    expect(w.vm.code).toBe('9NE')
    expect(caret(w)).toBe(3)
  })

  it('строчные буквы не сбивают каретку на границе группы', async () => {
    const w = mount(Harness)
    for (const ch of '2aw5') await typeChar(w, ch)
    const el = w.find('input').element as HTMLInputElement
    expect(el.value).toBe('2AW5-')
    expect(caret(w)).toBe(5)
  })
})
