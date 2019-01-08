import { SpriteConstructor } from '../../../utils/interfaces'
import gameStore from '../../../store/GameStore'

export type Code = '◻' | '▲' | '|||' | '☰' | 'O' | 'U'
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export default class KeyboardButton extends Phaser.GameObjects.Sprite {
  constructor(params: Omit<SpriteConstructor, 'texture'> & { code: Code }) {
    let texture = 'mdp_keyboard_1'
    switch (params.code) {
      case '◻':
        texture = 'mdp_keyboard_1'
        break
      case '▲':
        texture = 'mdp_keyboard_2'
        break
      case '|||':
        texture = 'mdp_keyboard_3'
        break
      case '☰':
        texture = 'mdp_keyboard_4'
        break
      case 'O':
        texture = 'mdp_keyboard_5'
        break
      case 'U':
        texture = 'mdp_keyboard_6'
        break
    }
    super(params.scene, params.x, params.y, texture, params.frame)

    this.setOrigin(0, 0).setScale(
      1 / gameStore.ratioResolution,
      1 / gameStore.ratioResolution
    )

    params.scene.add.existing(this)
  }
}
