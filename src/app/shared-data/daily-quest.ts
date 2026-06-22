export type DailyQuestDef = {
  id: string
  label: string
  reward: number
}

export const dailyQuests: DailyQuestDef[] = [
  { id: 'walk', label: 'Complete 1 walk', reward: 25 },
  { id: 'daily', label: 'Claim your daily bonus', reward: 20 },
  { id: 'care', label: 'Care for your pet 3 times', reward: 30 },
]

export const questForToday = (): DailyQuestDef =>
  dailyQuests[new Date().getDay() % dailyQuests.length]
