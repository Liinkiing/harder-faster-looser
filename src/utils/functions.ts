import { TweenLite } from 'gsap'
import { GameBackgroundColor } from './types'

export const wait = (ms: number): Promise<TimerHandler> =>
  new Promise(resolve => setTimeout(resolve, ms))

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const promiseAnimation = (animation: TweenLite | gsap.Animation) => {
  return new Promise(resolve =>
    animation.eventCallback('onComplete', async () => {
      resolve()
    })
  )
}

export const shuffle = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }

  return a
}

export const gameBackgroundColorToCss = (
  backgroundColor: GameBackgroundColor
): string => {
  if (typeof backgroundColor === 'object') {
    const { r, g, b, a } = backgroundColor
    return `rgba(${r},${g},${b},${a})`
  }

  return String(backgroundColor)
}
