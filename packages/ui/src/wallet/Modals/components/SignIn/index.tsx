import { ModalConfig } from '../..'
import { AcceptTerms } from './AcceptTerms'
import SelectWalletConnector from './SelectWalletConnector'

export const modalConfig: ModalConfig = {
  screens: [
    {
      id: 'selectWalletConnector',
      component: SelectWalletConnector,
      order: 1,
    },
    {
      id: 'acceptTerms',
      component: AcceptTerms,
      order: 2,
    },
  ],
}
