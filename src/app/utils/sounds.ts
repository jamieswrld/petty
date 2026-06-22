import { isMuted } from '@component/app/sound-store'

export type SoundId = 'click' | 'care' | 'coin' | 'claim' | 'walk'

let ctx: AudioContext | null = null
let lastCoinAt = 0

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!ctx) ctx = new AudioContext()
  return ctx
}

const tone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.08,
  delay = 0,
) => {
  const audio = getCtx()
  if (!audio || isMuted()) return

  if (audio.state === 'suspended') void audio.resume()

  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.value = volume
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + delay + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(audio.currentTime + delay)
  osc.stop(audio.currentTime + delay + duration)
}

const playClick = () => tone(880, 0.04, 'square', 0.06)

const playCare = () => {
  tone(523, 0.06, 'triangle', 0.07)
  tone(659, 0.08, 'triangle', 0.07, 0.05)
}

const playCoin = () => {
  const now = Date.now()
  if (now - lastCoinAt < 400) return
  lastCoinAt = now
  tone(988, 0.05, 'square', 0.05)
  tone(1318, 0.07, 'square', 0.04, 0.04)
}

const playClaim = () => {
  tone(523, 0.1, 'triangle', 0.08)
  tone(659, 0.1, 'triangle', 0.08, 0.1)
  tone(784, 0.14, 'triangle', 0.08, 0.2)
  tone(1046, 0.2, 'triangle', 0.07, 0.32)
}

const playWalk = () => tone(440, 0.03, 'square', 0.03)

const handlers: Record<SoundId, () => void> = {
  click: playClick,
  care: playCare,
  coin: playCoin,
  claim: playClaim,
  walk: playWalk,
}

export const playSound = ( id: SoundId ) => {
  if (isMuted()) return
  handlers[id]()
}
