import { gameConfig, HFLGameConfig } from '../../utils/game'
import gameStore from '../../store/GameStore'
import { BaseEvents, GameEvents, GameState } from '../../utils/enums'
import { minigameSuffix, scenesKeys } from '../../utils/constants'
import { EventEmitter } from 'events'
import { appear, disappear } from '../../utils/anims'
import { GameBackgroundColor } from '../../utils/types'
import { gameBackgroundColorToCss } from '../../utils/functions'
import minigameManager from './MinigameManager'
import AudioManager from './AudioManager'
import { BootScene } from '../scenes'

export const Emitter = new EventEmitter()

export class GameManager {
  public game: Phaser.Game = new Phaser.Game(gameConfig)
  public audio: AudioManager = new AudioManager(this)
  public activeScene?: Phaser.Scene
  public gameUI?: HTMLDivElement
  public gameFader?: HTMLDivElement

  constructor() {
    Emitter.on(BaseEvents.SceneInit, (scene: Phaser.Scene) => {
      this.activeScene = scene
    })
  }

  public suspendMinigame = (): void => {
    gameStore.changeConfig({
      suspended: true,
    })
  }

  public resumeMinigame = (): void => {
    gameStore.changeConfig({
      suspended: false,
    })
  }

  public startGame = (): void => {
    ;(this.game.scene.getScene(scenesKeys.Boot) as BootScene).startGame()
  }

  public loadSplashscreen = async () => {
    await this.startScene(scenesKeys.Splashscreen)
    gameStore.changeState(GameState.Splashscreen)
  }

  public loadHomescreen = async () => {
    await this.startScene(scenesKeys.Homescreen)
    gameStore.changeState(GameState.Homescreen)
  }

  public loadMinigame = async (minigameKey: string) => {
    gameManager.suspendMinigame()
    await minigameManager.startGame(minigameKey)
  }

  public loadNextMinigame = async () => {
    gameManager.suspendMinigame()
    await this.startScene(minigameManager.pickNextGameKey())
  }

  public loadPostMinigame = async () => {
    gameManager.suspendMinigame()
    await this.startScene(scenesKeys.PostMinigameScene)
  }

  public loadDeathscreen = async () => {
    await this.startScene(scenesKeys.Deathscreen)
  }

  public startScene = async (
    key: string,
    config: HFLGameConfig = gameStore.config,
    optionnalData?: any
  ) => {
    Object.keys(GameEvents).forEach(event => {
      Emitter.removeAllListeners(GameEvents[event])
    })
    console.log('STARTED ' + key)
    if (this.gameFader && config.fade) {
      gameStore.startTransitionning()
      await appear(this.gameFader)
      this.game.scene.scenes
        .filter(scene => scene.scene.key !== key)
        .forEach(scene => scene.scene.stop(scene.scene.key))
      gameManager.resumeMinigame()
      this.game.scene.start(key, optionnalData)
      gameStore.changeState(
        key.includes(minigameSuffix) ? GameState.Minigame : (key as GameState)
      )
      gameStore.regenerateUiKey()
      gameStore.stopTransitionning()
      await disappear(this.gameFader)
      if (gameStore.paused) {
        gameStore.resume()
      }
    } else {
      this.game.scene.scenes
        .filter(scene => scene.scene.key !== key)
        .forEach(scene => scene.scene.stop(scene.scene.key))
      gameStore.startTransitionning()
      gameManager.resumeMinigame()
      this.game.scene.start(key, optionnalData)
      gameStore.stopTransitionning()
      gameStore.changeState(
        key.includes(minigameSuffix) ? GameState.Minigame : (key as GameState)
      )
      gameStore.regenerateUiKey()
      if (gameStore.paused) {
        gameStore.resume()
      }
    }
  }

  public pause = (): void => {
    if (!this.activeScene) {
      return
    }
    this.activeScene!.scene.pause()
    gameStore.pause()
  }

  public resume = (): void => {
    if (!this.activeScene) {
      return
    }
    this.activeScene!.scene.resume()
    gameStore.resume()
  }

  public changeBackgroundColor = (color: GameBackgroundColor): void => {
    if (this.activeScene) {
      this.activeScene.cameras.main.setBackgroundColor(
        gameBackgroundColorToCss(color)
      )
    }
  }

  public restartActiveScene = async (
    config: HFLGameConfig = gameStore.config,
    data?: object
  ) => {
    if (this.activeScene) {
      await this.startScene(this.activeScene.scene.key, config, data)
    }
  }

  public togglePause = (): void => {
    if (!this.activeScene) {
      return
    }
    if (gameStore.paused) {
      this.activeScene!.sound.setDetune(0)
      this.activeScene!.scene.resume()
      gameStore.resume()
    } else {
      this.activeScene!.sound.setDetune(-1200)
      this.activeScene!.scene.pause()
      gameStore.pause()
    }

    console.log('TOGGLE PAUSE')
  }

  get hasTokiJustLost(): boolean {
    return (
      gameStore.hasJustLoosedBrain ||
      gameStore.hasJustLoosedHeart ||
      gameStore.hasJustStress
    )
  }

  public resetTokiStatus = (): void => {
    gameStore.resetTokiStatus()
  }

  public looseLife = (): void => {
    gameStore.looseLife()
  }

  get isTokiDead() {
    return !gameStore.status.hasHeart
  }
}

const gameManager = new GameManager()
export default gameManager
