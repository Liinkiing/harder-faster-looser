import { scenesKeys } from '../../utils/constants'
import gameManager from '../manager/GameManager'
import BaseScene from './BaseScene'
import gameStore from '../../store/GameStore'

export default class BootScene extends BaseScene {
  constructor() {
    super({
      key: scenesKeys.Boot,
    })
  }

  public preload(): void {
    super.preload()
    this.load.setBaseURL(process.env.PUBLIC_URL)
    this.load.pack('preload', '/static/assets/sprites/pack.json', 'preload')
  }

  public update(time: number, delta: number): void {}

  public create = async () => {
    super.create()
    gameStore.stopLoading()
    if (gameStore.config.dev) {
      this.startGame()
    }
  }

  public startGame = (): void => {
    gameStore.startGame()
    const initial = gameStore.config.fade
    gameStore.changeConfig({ fade: false })
    gameManager.loadSplashscreen()
    gameStore.changeConfig({ fade: initial })
    this.scene.stop(this.scene.key)
  }
}
