import React, { FunctionComponent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import gameManager, { Emitter } from '../../../game/manager/GameManager'
import { GameEvents } from '../../../utils/enums'
import gameStore from '../../../store/GameStore'
import { observer } from 'mobx-react-lite'
import { yellow } from '../../../utils/colors'
import { border, boxShadow } from '../../../utils/css'
import { useGameloop } from '../../../utils/hooks'

const ProgressOuter = styled.div`
  position: relative;
  right: -4px;
  width: 100%;
  height: 40px;
  ${border};
  ${boxShadow};
  background: white;
`

const ProgressInner = styled.div`
  height: 100%;
  will-change: width;
  background: ${yellow};
`

const RemainingTime: FunctionComponent = () => {
  const {
    addToScore,
    config: { minigameDuration, suspended },
  } = gameStore
  const [remaining, setRemaining] = useState(0)
  const button = useRef<HTMLButtonElement>(null)
  const progress = 100 - (remaining / minigameDuration) * 100

  useGameloop(() => {
    if (button.current) {
      button.current.click()
    }
  })

  useEffect(
    () => {
      Emitter.on(GameEvents.MinigameSuccess, () => {
        addToScore(Math.floor(progress))
      })
      Emitter.on(GameEvents.MinigameFailure, () => {
        addToScore(0)
      })

      return () => {
        Emitter.removeAllListeners(GameEvents.MinigameSuccess)
        Emitter.removeAllListeners(GameEvents.MinigameFailure)
      }
    },
    [progress]
  )

  if (remaining >= minigameDuration!) {
    gameManager.activeScene!.time.removeAllEvents()
    Emitter.emit(GameEvents.RemainingTimeOver)
    setRemaining(minigameDuration - 0.00001)
  }

  const onClick = () => {
    if (!suspended) {
      gameStore.increaseElapsed()
      setRemaining(remaining + 1)
    }
  }

  return (
    <ProgressOuter className="progress remaining-time">
      <button
        ref={button}
        onClick={onClick}
        style={{ pointerEvents: 'all', display: 'none' }}
      />
      <ProgressInner
        style={{ width: `${progress}%` }}
        className="progress inner"
      >
        <span style={{ display: 'none' }} aria-hidden={true}>
          {progress}%
        </span>
      </ProgressInner>
    </ProgressOuter>
  )
}

export default observer(RemainingTime)
