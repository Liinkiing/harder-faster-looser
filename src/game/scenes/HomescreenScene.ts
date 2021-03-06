import { scenesKeys } from '../../utils/constants'
import BaseScene from './BaseScene'
import gameStore from '../../store/GameStore'
import gameManager from '../manager/GameManager'
import { blue, green, yellow } from '../../utils/colors'
import { Shaker } from '../../Shaker'
import { List } from '../../utils/extensions'
import { gameWait, mapRange } from '../../utils/functions'
import TokiDreams from '../objects/homescreen/TokiDreams'

enum TokiState {
  Sleeping,
  WakingUp,
  WakedUp,
}

const CYCLE_BEFORE_WAKE_UP = 3
const AVAILABLE_HURT_SOUNDS = new List(['hurtmc', 'hurtrb'])

export default class HomescreenScene extends BaseScene {
  private shaker?: Shaker
  private dreams?: TokiDreams
  private lullaby?: Phaser.Sound.WebAudioSound
  private crushedLullaby?: Phaser.Sound.WebAudioSound
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
    gameManager.audio.stopBg()
    this.lullaby = gameManager.audio.addLayeredSound('lullaby', {
      volume: 0.05,
      loop: true,
    })
    this.lullaby.play()
    if (!gameManager.isDesktop) {
      this.crushedLullaby = gameManager.audio.addLayeredSound(
        'lullaby_crushed',
        { volume: 0, loop: true }
      )
      this.crushedLullaby.play()
    }
    gameManager.changeBackgroundColor(blue)
    if (!gameManager.isDesktop) {
      this.createActionIndicator()
    }
    this.toki = this.add
      .sprite(window.innerWidth / 2, window.innerHeight, 'intro_sleep')
      .setOrigin(0.5, 1)
      .setScale(18 / gameStore.ratioResolution)
      .play('intro_sleep_animation')

    this.time.addEvent({
      loop: true,
      delay: this.toki.anims.currentAnim.msPerFrame,
      callback: () => {
        if (
          this.toki &&
          this.toki.anims.currentAnim.key === 'intro_sleep_animation'
        ) {
          switch (this.toki.anims.currentFrame.index) {
            case 1:
              gameManager.audio.playSfx('snoring_1', { volume: 0.4 })
              break
            case 3:
              gameManager.audio.playSfx('snoring_2', { volume: 0.4 })
              break
          }
        }
      },
    })

    this.dreams = new TokiDreams({
      scene: this,
      x: window.innerWidth / 2,
      y: window.innerHeight - 660,
    })
  }

  public update(time: number, delta: number): void {}

  public destroy(): void {
    super.destroy()
    gameStore.changeConfig({
      backgroundColor: green,
    })
    gameStore.showUserInterface()
    gameManager.audio.stopLayeredSounds()
  }

  private onShake = (): void => {
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
        if (this.dreams) {
          this.dreams.setX(TokiDreams.positionsOffset[this.shakeFrame])
          this.dreams.setZzzPosition(
            TokiDreams.positionsOffset[this.shakeFrame],
            this.dreams.y
          )
        }
        if (this.shakeFrame % 29 === 0) {
          this.cycleRemaining--
          const lullabyCrushedSound = mapRange(
            this.cycleRemaining,
            CYCLE_BEFORE_WAKE_UP,
            0.1,
            0,
            0.3
          )
          const lullabySound = mapRange(
            this.cycleRemaining,
            0,
            CYCLE_BEFORE_WAKE_UP,
            0,
            0.05
          )

          this.lullaby!.setVolume(lullabySound)
          this.crushedLullaby!.setVolume(lullabyCrushedSound)
        }
        if (this.shakeFrame === 9 || this.shakeFrame === 23) {
          // Corresponds to frame in which Toki is actually hurt
          gameManager.audio.playUniqueSfx(AVAILABLE_HURT_SOUNDS.random(), {
            volume: 0.9,
          })
          gameManager.vibrate(200)
        }
        break
      case TokiState.WakedUp:
        if (this.shaker) {
          this.shaker.stop()
          this.shaker.removeEventListener('shake', this.onShake)
        }
        if (this.dreams) {
          this.dreams.destroy()
        }
        gameManager.audio.stopLayeredSounds()
        const transition = this.add
          .sprite(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'intro_transition_v_02'
          )
          .setOrigin(0.5, 0.5)
          .setScale(18 / gameStore.ratioResolution)
          .setDepth(1000)

        transition
          .play('intro_transition_animation')
          .on('animationcomplete', () => {
            transition.destroy()
          })
        gameStore.hideUserInterface()
        gameWait(this.time, 700).then(() => {
          this.toki!.anims.play('intro_wake_up_blue_animation', true).on(
            'animationcomplete',
            () => {
              gameStore.changeConfig({
                backgroundColor: yellow,
              })
              if (
                this.toki!.anims.currentAnim.key ===
                'intro_wake_up_blue_animation'
              ) {
                gameManager.audio.playSfx('crack', { volume: 0.8 })
                gameWait(this.time, 1000).then(() => {
                  gameManager.audio.playSfx('angry', { volume: 0.6 })
                })
                this.toki!.anims.play(
                  'intro_wake_up_yellow_animation',
                  true
                ).on('animationcomplete', () => {
                  gameManager.audio.playBg()
                  gameManager.loadNextMinigame()
                })
              }
            }
          )
        })
        break
    }
  }

  private createActionIndicator = () => {
    this.actionIndicator = this.add
      .sprite(window.innerWidth / 2, window.innerHeight - 60, 'shake')
      .setOrigin(0.5, 0.5)
      .setScale(3)
      .setDepth(9999)
      .play('shake_animation')
  }
}
