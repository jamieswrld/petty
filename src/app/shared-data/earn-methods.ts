import { milestones, formatThreshold } from './milestones'

export type EarnMethod = {
  id: string
  title: string
  coins: string
  description: string
  tip?: string
}

export const earnMethods: EarnMethod[] = [
  {
    id: 'walk',
    title: 'Walk your pet',
    coins: '1–1.35 / sec',
    description:
      'When your pet needs a bathroom break (urine above 50), pick a scene and go for a walk. You earn coins every second until they are relieved.',
    tip: 'Login streaks boost walk earnings up to ~35% at a 7-day streak.',
  },
  {
    id: 'daily',
    title: 'Daily check-in',
    coins: '10–70',
    description:
      'Claim your daily bonus from the game screen. The reward scales with your consecutive-day login streak.',
    tip: 'Come back every day — missing a day resets your streak to 1.',
  },
  {
    id: 'care',
    title: 'Care actions',
    coins: '1–2 / action',
    description:
      'Feeding, hydrating, and playing with your pet earns tiny coin rewards on top of keeping stats healthy. Every bit counts over a long grind.',
  },
  {
    id: 'happy',
    title: 'Happy pet bonus',
    coins: '2 / 90 sec',
    description:
      'Keep hunger, thirst, and happiness all above 75 and your pet passively earns coins while you stay on the game screen.',
  },
  {
    id: 'pet',
    title: 'Pet your companion',
    coins: '1 / tap',
    description:
      'Tap your pet up to 15 times per day for a slow coin drip.',
  },
  {
    id: 'milestones',
    title: '$Petana milestone claims',
    coins: '500–3,000 $Petana',
    description:
      'Hit lifetime coin milestones, connect a wallet, and claim $Petana on-chain when the treasury is live. Test mode pays 1 token per claim for dry runs.',
    tip: `Progression: ${milestones.map(( m ) => {
      const token = m.tokenPayout ? ` → ${formatThreshold(m.tokenPayout)} $Petana` : ''
      return `${m.reward} (${formatThreshold(m.threshold)} coins${token})`
    }).join(' · ')}.`,
  },
]
