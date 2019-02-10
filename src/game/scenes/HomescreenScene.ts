import { scenesKeys } from '../../utils/constants'
import BaseScene from './BaseScene'
import gameStore from '../../store/GameStore'
import gameManager from '../manager/GameManager'
import { blue } from '../../utils/colors'
import { Shaker } from '../../Shaker'
import { List } from '../../utils/extensions'

enum TokiState {
  Sleeping,
  WakingUp,
  WakedUp,
}

const CYCLE_BEFORE_WAKE_UP = 3
const AVAILABLE_HURT_SOUNDS = new List(['hurtmc', 'hurtrb'])

export default class HomescreenScene extends BaseScene {
  private shaker?: Shaker
  private toki?: Phaser.GameObjects.Sprite
  private cycleRemaining = CYCLE_BEFORE_WAKE_UP
  private actionIndicator?: Phaser.GameObjects.Sprite
  private shakeFrame = 0
  private state: TokiState = TokiState.Sleeping

  constructor() {
    super({
      key: scenesKeys.Homescreen,
    })
  }

  public create(): void {
    super.create()
    this.shakeFrame = 0
    this.cycleRemaining = CYCLE_BEFORE_WAKE_UP
    this.state = TokiState.Sleeping
    if (!gameManager.isDesktop && Shaker.hasDeviceMotion()) {
      this.shaker = new Shaker({ timeout: 20, threshold: 1 })
      this.shaker.start()
      this.shaker.addEventListener('shake', this.onShake)
    }
    gameManager.audio.resetDetune()
    gameManager.audio.playBg()
    gameManager.changeBackgroundColor(blue)
    if (!gameManager.isDesktop) {
      this.createActionIndicator()
    }
    this.toki = this.add
      .sprite(window.innerWidth / 2, window.innerHeight, 'intro_sleep')
      .setOrigin(0.5, 1)
      .setScale(18 / gameStore.ratioResolution)
      .play('intro_sleep_animation')
  }

  public update(time: number, delta: number): void {}

  public destroy(): void {
    super.destroy()
  }

  private onShake = (): void => {
    console.log('ON SHAKE')
    if (this.cycleRemaining === 0) {
      this.state = TokiState.WakedUp
    }
    switch (this.state) {
      case TokiState.Sleeping:
        this.state = TokiState.WakingUp
        break
      case TokiState.WakingUp:
        if (this.actionIndicator) {
          this.actionIndicator.destroy()
        }
        this.toki!.anims.play('intro_shake_animation', false, this.shakeFrame)
        this.toki!.anims.stop()
        this.shakeFrame++
        this.shakeFrame = this.shakeFrame % 29
        if (this.shakeFrame % 29 === 0) {
          this.cycleRemaining--
        }
        if (this.shakeFrame === 9 || this.shakeFrame === 23) {
          // Corresponds to frame in which Toki is actually hurt
          gameManager.audio.playUniqueSfx(AVAILABLE_HURT_SOUNDS.random(), {
            volume: 0.9,
          })
        }
        break
      case TokiState.WakedUp:
        if (this.shaker) {
          this.shaker.stop()
          this.shaker.removeEventListener('shake', this.onShake)
        }
        gameManager.loadNextMinigame()
        break
    }
  }

  private createActionIndicator = () => {
    this.actionIndicator = this.add
      .sprite(window.innerWidth / 2, window.innerHeight / 2 - 220, 'shake')
      .setOrigin(0.5, 0.5)
      .setScale(3)
      .setDepth(9999)
      .play('shake_animation')
  }
}
