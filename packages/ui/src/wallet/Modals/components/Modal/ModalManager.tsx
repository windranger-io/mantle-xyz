'use client'

/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  createRef,
} from 'react'
import { AnimatePresence, useAnimation } from 'framer-motion'
import { ReactPortal } from '.'
import { BackgroundOverlay } from './styles'

export interface ModalContent {
  label: string
  description: string
  error?: string
}

export interface PassProps {
  [key: string]: string
}

export interface PassPropsState {
  [key: string]: PassProps
}

/**
 * Interface for components to be be passed in to the Modal Manager
 */
export interface ModalScreenProps {
  /**
   * Go to another screen by INDEX and pass properties
   */
  viewScreen: (screen: number, passProps: PassProps) => void
  /**
   * Go to another screen by ID and pass properties
   */
  viewScreenById: (screen: string, passProps: PassProps) => void
  /**
   * Convenience method to jump to next screen
   */
  next: (passProps: PassProps) => void
  /**
   * Convenience method to jump to previous screen
   */
  prev: (passProps: PassProps) => void
  /**
   * Hide modal
   */
  setShow: Dispatch<SetStateAction<boolean>>
  /**
   * Lock the current modal from being closed
   */
  lock: Dispatch<SetStateAction<boolean>>
  /**
   * Content for modal
   */
  content?: ModalContent

  /**
   * Props passed in from other screens
   */
  passProps: PassProps
}

/**
 * Interface for configuring modal screens in ModalConfig
 */
export interface ModalScreen {
  /**
   * Unique identifier
   */
  id: string
  /**
   * Display content for modal
   */
  content?: ModalContent
  /**
   * React function component
   */
  component: React.FC<ModalScreenProps>
  /**
   * Ignore this screen when go back through screens
   */
  ignoreHistory?: boolean
  /**
   * Display order
   */
  order: number
}

export interface ModalFlow {
  id: string
  order: number
  screens: ModalScreen[]
}

/**
 * Interface for ModalConfig
 */
export interface ModalConfig {
  /**
   * A list of screens to show
   */
  screens: ModalScreen[]

  /**
   * Not implmented yet...
   */
  flows?: ModalFlow[]
  /**
   * A progress bar component that
   */
  progress?: React.FC<ProgressProps>
}

interface ProgressProps {
  config: ModalConfig
  current: number
  complete: boolean
}

/**
 * Interface for ModalManager. This orchestrates and renders components passed to from the congfig
 */
export interface ModalManagerProps {
  /**
   * Allow clicks on background to close
   */
  backgroundClose: boolean
  /**
   * Configuration object
   */
  config: ModalConfig
  /**
   * State to show modal
   */
  show: boolean
  /**
   * Set the modal to shown or hidden
   */
  setShow: Dispatch<SetStateAction<boolean>>
  /**
   * Flag to watch if another modal stack is opened. Default is to close
   */
  otherModalOpen: boolean
}

/**
 * Modal Manager component
 */
const ModalManager: React.FC<ModalManagerProps> = ({
  config,
  show,
  setShow,
  backgroundClose = true,
  otherModalOpen = false,
}) => {
  const [currentScreen, setScreen] = useState(0)
  const [props, setProps] = useState<PassPropsState>({})
  const backgroundRef = createRef<HTMLDivElement>()
  const [history, setHistory] = useState<string[]>([])
  const [locked, setLocked] = useState(false)
  const controls = useAnimation()

  /**
   * View a screen in the modal stack. Pass props to the screen to render
   */
  const viewScreen = (screen: number, passProps: PassProps) => {
    const { id } = config.screens[screen]

    setProps(s => {
      return {
        ...s,
        [id]: passProps,
      }
    })
    setScreen(screen)
    setHistory(s => s.concat(id))
  }

  /**
   * View a screen in the modal stack. Pass props to the screen to render
   */
  useEffect(() => {
    if (show) {
      controls.start('appear')
    }
  }, [controls, show])

  /**
   * View a screen in the modal stack. Pass props to the screen to render
   */
  const viewScreenById = (
    id: string,
    passProps: PassProps,
    logHistory = true,
  ) => {
    const _screen = config.screens.find(screen => screen.id === id)

    if (_screen) {
      setProps(s => {
        return {
          ...s,
          [_screen.id]: passProps,
        }
      })
      setScreen(config.screens.indexOf(_screen))

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      logHistory && setHistory(s => s.concat(_screen.id))
    }
  }

  /**
   * Initialize the state to the forst screen when opened
   */
  useEffect(() => {
    setScreen(0)
    setProps({})
  }, [show])

  useEffect(() => {
    const START_SCREEN = config.screens[0].id

    setHistory([START_SCREEN])
  }, [show, config])

  /**
   * Prevent janky scroll stuff when modal is open
   */
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [show])

  useEffect(() => {
    if (otherModalOpen) {
      setShow(false)
    }
  }, [otherModalOpen, setShow])

  const captureBackgroundClick = (ev: React.MouseEvent<HTMLDivElement>) => {
    const target = ev.target as HTMLDivElement

    if (
      !locked &&
      backgroundClose &&
      target.id === 'modal_background_overlay'
    ) {
      setShow(false)
    }
  }

  const next = (_passProps: PassProps) => {
    if (currentScreen === config.screens.length - 1) return
    viewScreen(currentScreen + 1, _passProps)
  }
  const prev = (_passProps: PassProps) => {
    if (currentScreen === 0) return

    const previous = history.length - 2
    if (previous > -1) {
      const prevHist = history[previous]
      const prevScreen = config.screens.find(screen => screen.id === prevHist)

      if (prevScreen?.ignoreHistory) {
        viewScreenById(history[previous - 1], _passProps, false)
        setHistory(h => h.slice(0, -2))
      } else {
        viewScreenById(history[previous], _passProps, false)
        setHistory(h => h.slice(0, -1))
      }
    }
  }

  const screens = config.screens.sort((a, b) => a.order - b.order)
  const Screen = screens[currentScreen]

  return (
    <ReactPortal wrapperId="modal-root">
      <AnimatePresence>
        {show && (
          <BackgroundOverlay
            onClick={captureBackgroundClick}
            id="modal_background_overlay"
            ref={backgroundRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* eslint-disable-next-line react/jsx-pascal-case */}
            <Screen.component
              next={next}
              prev={prev}
              viewScreen={viewScreen}
              viewScreenById={viewScreenById}
              setShow={setShow}
              content={Screen.content}
              passProps={props[Screen.id]}
              lock={setLocked}
            />
          </BackgroundOverlay>
        )}
      </AnimatePresence>
    </ReactPortal>
  )
}

export default ModalManager
