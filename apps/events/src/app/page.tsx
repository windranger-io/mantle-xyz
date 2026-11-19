import Ethcc from '../components/Ethcc'
import EthccSuccess from '../components/EthccSuccess'
import EthccClaimFail from '../components/EthccClaimFail'

export default function Page() {
  return (
    <>
      <Ethcc />
      <EthccSuccess />
      <EthccClaimFail />
    </>
  )
}
