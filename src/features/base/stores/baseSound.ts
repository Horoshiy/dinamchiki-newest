// Звук «Тайной базы»: короткие синтезированные сигналы WebAudio (без ассетов).
// Включён по умолчанию; один тумблер сверху глушит всё. Контекст создаётся
// лениво и возобновляется по первому жесту (политика autoplay браузеров).
import { defineStore } from 'pinia'

const SOUND_KEY = 'dinamchiki-base-sound'

type Cue = 'click' | 'select' | 'success' | 'fanfare' | 'error' | 'xp' | 'badge'

function readEnabled(): boolean {
  try { return localStorage.getItem(SOUND_KEY) !== '0' } catch { return true }
}

export const useBaseSound = defineStore('baseSound', {
  state: () => ({
    enabled: readEnabled(),
    ctx: null as AudioContext | null,
  }),
  actions: {
    setEnabled(on: boolean) {
      this.enabled = on
      try { localStorage.setItem(SOUND_KEY, on ? '1' : '0') } catch { /* noop */ }
      if (on) this.unlock()
    },
    toggle() { this.setEnabled(!this.enabled) },

    /** Создаёт/возобновляет контекст — звать по пользовательскому жесту. */
    unlock() {
      if (!this.enabled || typeof window === 'undefined') return
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      if (!this.ctx) {
        try { this.ctx = new AC() } catch { return }
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume()
    },

    play(cue: Cue) {
      if (!this.enabled) return
      this.unlock()
      const ctx = this.ctx
      if (!ctx || ctx.state !== 'running') return
      const now = ctx.currentTime
      switch (cue) {
        case 'click': this.tone(ctx, now, 520, 0.05, 'square', 0.05); break
        case 'select': this.tone(ctx, now, 660, 0.07, 'triangle', 0.07); break
        case 'xp': this.tone(ctx, now, 880, 0.09, 'sine', 0.08); break
        case 'badge':
          this.tone(ctx, now, 740, 0.1, 'triangle', 0.08)
          this.tone(ctx, now + 0.09, 1108, 0.14, 'triangle', 0.08)
          break
        case 'success':
          this.tone(ctx, now, 523, 0.1, 'sine', 0.09)
          this.tone(ctx, now + 0.1, 784, 0.16, 'sine', 0.09)
          break
        case 'fanfare':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(ctx, now + i * 0.11, f, 0.18, 'triangle', 0.09))
          break
        case 'error': this.tone(ctx, now, 220, 0.18, 'sawtooth', 0.06); break
      }
    },

    tone(ctx: AudioContext, at: number, freq: number, dur: number, type: OscillatorType, gain: number) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, at)
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(gain, at + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
      osc.connect(g).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + dur + 0.02)
    },
  },
})