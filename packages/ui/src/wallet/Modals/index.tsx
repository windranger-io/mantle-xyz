import dynamic from 'next/dynamic'

export type {
  ModalConfig,
  ModalScreenProps,
} from './components/Modal/ModalManager'

const Modal = dynamic(
  () => import('components/Modals/components/Modal/ModalManager'),
  {
    ssr: false,
  }
)

export default Modal
