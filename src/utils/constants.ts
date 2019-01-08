import { GameCategory } from './enums'

export const minigameSuffix = '_MINIGAME'

export const scenesKeys = {
  Boot: 'BOOT',
  Splashscreen: 'SPLASHSCREEN',
  Homescreen: 'HOMESCREEN',

  SandwichGame: 'SANDWICH'+ minigameSuffix,
  SpamMinigame: 'SPAM' + minigameSuffix,

  PostMinigameScene: 'POSTMINIGAME',

  Deathscreen: 'DEATHSCREEN',
}

export const categoriesProbability = {
  [GameCategory.Action]: 0.9,
  [GameCategory.Waiting]: 0.1,
}
