import Destination from './Destination'
import Divider from './Divider'
import TokenSelect from './TokenSelect'
import TransactionPanel from './TransactionPanel'
import CTA from './CTA'

export default function Withdraw() {
  return (
    <div>
      <TokenSelect />
      <Divider />
      <Destination />
      <CTA />
      <TransactionPanel />
    </div>
  )
}
