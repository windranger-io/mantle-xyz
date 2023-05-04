import Divider from './Divider'
import TokenSelect from './TokenSelect'
import TransactionPanel from './TransactionPanel'

export default function Withdraw() {
  return (
    <div>
      Withdraw Body
      <TokenSelect />
      <Divider />
      <TransactionPanel />
    </div>
  )
}
