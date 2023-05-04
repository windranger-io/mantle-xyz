import Divider from './Divider'
import TokenSelect from './TokenSelect'
import TransactionPanel from './TransactionPanel'

export default function Deposit() {
  return (
    <div>
      Deposit Body
      <TokenSelect />
      <Divider />
      <TransactionPanel />
    </div>
  )
}
