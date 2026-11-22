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

describe('поле ввода кода игрока', () => {
  it('кириллица не попадает в значение и в модель', async () => {
    const w = mount(Harness)
    const input = w.find('input')
    await input.setValue('Ф2AW5')
    expect((input.element as HTMLInputElement).value).toBe('2AW5')
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
})
