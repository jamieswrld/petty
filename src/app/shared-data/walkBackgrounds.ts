export type WalkPlace = {
  id: string
  name: string
  background: string
}

export const walkBackgroundList: WalkPlace[] = [
  {
    id: 'flower',
    name: 'Flower Field',
    background: 'linear-gradient(180deg, #87CEEB 0%, #98D98E 55%, #FFB6C1 100%)',
  },
  {
    id: 'mystical',
    name: 'Mystical Grove',
    background: 'linear-gradient(180deg, #1a1a4e 0%, #4a2d7a 45%, #7daffa 100%)',
  },
  {
    id: 'vacation',
    name: 'Beach Day',
    background: 'linear-gradient(180deg, #7daffa 0%, #f4e4a6 50%, #f4bda3 100%)',
  },
  {
    id: 'landscape',
    name: 'Sunset Hills',
    background: 'linear-gradient(180deg, #4565e8 0%, #f4bda3 40%, #FF8688 100%)',
  },
  {
    id: 'camp',
    name: 'Campfire',
    background: 'linear-gradient(180deg, #2d4bc4 0%, #4565e8 35%, #f4bda3 70%, #FF6C6F 100%)',
  },
]
