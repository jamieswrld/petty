import type { Pet } from '@component/app/types/pet'
import { HAPPY_STAT_MIN } from '@component/app/shared-data/economy'

export type PetNeed = {
  message: string
  action: string
}

export const getPetNeed = ( pet: Pet ): PetNeed | null => {
  if (pet.urine > 50) {
    return { message: 'Your pet needs a walk!', action: 'Pick a walk scene below when urine is high.' }
  }
  if (pet.fullness < 50) {
    return { message: 'Your pet is hungry.', action: 'Grab a meal from the list on the left.' }
  }
  if (pet.thirst < 50) {
    return { message: 'Your pet is thirsty.', action: 'Give them a drink.' }
  }
  if (pet.happiness < 50) {
    return { message: 'Your pet wants to play.', action: 'Use a toy to boost happiness.' }
  }
  return null
}

export type PetMood = {
  text: string
  tone: 'happy' | 'neutral' | 'sad' | 'urgent'
}

const moodLines = {
  urgent: ['I really need a walk…', 'Bathroom emergency!', 'Hurry — walk time!'],
  hungry: ['Feed me please!', 'My tummy is rumbling…', 'Got any snacks?'],
  thirsty: ['So thirsty…', 'Water please!', 'Need a drink!'],
  sad: ['Play with me?', 'I\'m bored…', 'Got a toy?'],
  happy: ['Life is good!', 'Best day ever!', 'Love you!', 'You\'re the best!'],
  chill: ['*happy wiggle*', 'Comfy cozy~', 'All good here!'],
}

const pick = ( lines: string[] ) => lines[Math.floor(Math.random() * lines.length)]

export const getPetMood = ( pet: Pet ): PetMood => {
  if (pet.urine > 50) return { text: pick(moodLines.urgent), tone: 'urgent' }
  if (pet.fullness < 50) return { text: pick(moodLines.hungry), tone: 'sad' }
  if (pet.thirst < 50) return { text: pick(moodLines.thirsty), tone: 'sad' }
  if (pet.happiness < 50) return { text: pick(moodLines.sad), tone: 'sad' }
  if (pet.fullness >= HAPPY_STAT_MIN && pet.thirst >= HAPPY_STAT_MIN && pet.happiness >= HAPPY_STAT_MIN) {
    return { text: pick(moodLines.happy), tone: 'happy' }
  }
  return { text: pick(moodLines.chill), tone: 'neutral' }
}
