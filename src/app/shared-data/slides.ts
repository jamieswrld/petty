import { Diet } from '@component/app/types/pet'

export type Slide = {
  id: string
  image: string
  alt: string
  name: string
  diet: Diet
}

export const slides: Slide[] = [
  {
    id: '1',
    image: '/pets/fox.svg',
    alt: 'Fox',
    name: 'Tibetan',
    diet: 'Carnivore',
  },
  {
    id: '2',
    image: '/pets/dog.svg',
    alt: 'Dog',
    name: 'Billy',
    diet: 'Carnivore',
  },
  {
    id: '3',
    image: '/pets/sand_cat.svg',
    alt: 'Cat',
    name: 'Michi',
    diet: 'Carnivore',
  },
  {
    id: '4',
    image: '/pets/koala.svg',
    alt: 'Koala',
    name: 'Koko',
    diet: 'Herbivore',
  },
  {
    id: '5',
    image: '/pets/rabbit.svg',
    alt: 'Rabbit',
    name: 'Rabbit',
    diet: 'Herbivore',
  },
  {
    id: '6',
    image: '/pets/otter.svg',
    alt: 'Otter',
    name: 'Lola',
    diet: 'Carnivore',
  },
  {
    id: '7',
    image: '/pets/bat.svg',
    alt: 'Bat',
    name: 'Batinga',
    diet: 'Carnivore',
  },
  {
    id: '8',
    image: '/pets/toucan.svg',
    alt: 'Toucan',
    name: 'Youcan',
    diet: 'Herbivore',
  },
  {
    id: '0',
    image: '/pets/hamster.svg',
    alt: 'Hamster',
    name: 'Nomnom',
    diet: 'Herbivore',
  },
  {
    id: '10',
    image: '/pets/capybara.svg',
    alt: 'Capybara',
    name: 'Capybara',
    diet: 'Herbivore',
  },
]

const imageKey = ( image: string ) => image.replace(/^\//, '')

export const slideByImage = Object.fromEntries(
  slides.flatMap(( slide ) => [
    [slide.image, slide],
    [imageKey(slide.image), slide],
  ]),
)

export function getSlideForImage( image: string ): Slide | undefined {
  return slideByImage[image] ?? slideByImage[imageKey(image)]
}
