import Destination from './Destination'
import Divider from './Divider'
import TokenSelect from './TokenSelect'
import TransactionPanel from './TransactionPanel'

export default function Deposit() {
  return (
    <div>
      <TokenSelect />
      <Divider />
      <Destination />
      <TransactionPanel />
    </div>
  )
}
