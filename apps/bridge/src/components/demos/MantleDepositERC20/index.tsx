import { MessageStatus } from '@mantleio/sdk'
import { goerli } from 'wagmi/chains'
import { parseUnits } from '@ethersproject/units'
import { useMutation } from '@tanstack/react-query'

import BasicButton from 'src/components/buttons/BasicButton'
import { useMantleSDK } from 'src/providers/mantle-sdk-context'
import { MANTLE_TESTNET_CHAIN_ID } from 'src/config/mantle-chain'
import { TokenSymbol } from 'src/config/tokens'
import useSafeNetwork from 'src/utils/hooks/use-safe-network'
import { getErrorMessage } from 'src/utils/helpers/error-handling'
import { getTokenBySymbol } from 'src/utils/helpers/tokens'

interface Props {
  tokenSymbol: TokenSymbol
  tokenAmount: number
}

// RE: https://mantlenetworkio.github.io/mantle-tutorial/cross-dom-bridge-erc20/
// How to deposit ERC20 from L1 to L2
function MantleDepositERC20({ tokenSymbol, tokenAmount }: Props) {
  const { chain } = useSafeNetwork()

  const connectedChainID = chain.id

  const { crossChainMessenger } = useMantleSDK()

  const goerliERC20Token = getTokenBySymbol(goerli.id, tokenSymbol)

  const mantleTestnetERC20Token = getTokenBySymbol(
    MANTLE_TESTNET_CHAIN_ID,
    tokenSymbol,
  )

  const {
    mutate: depositERC20Mutate,
    isLoading: depositERC20MutateIsLoading,
    isError: depositERC20MutateIsError,
    error: depositERC20MutateError,
    isSuccess: depositERC20MutateIsSuccess,
  } = useMutation({
    mutationFn: async (depositERC20Amount: number) => {
      if (crossChainMessenger === undefined) {
        throw new Error('Something went wrong!')
      }

      // eslint-disable-next-line no-console
      console.log('Deposit ERC20')

      const startTime = new Date().getTime()

      const bigDepositERC20Amount = parseUnits(
        depositERC20Amount.toString(),
        goerliERC20Token.decimals,
      )

      // Need the l2 address to know which bridge is responsible
      const allowanceResponse =
        // TODO: allow the max number
        await crossChainMessenger.approveERC20(
          goerliERC20Token.address,
          mantleTestnetERC20Token.address,
          bigDepositERC20Amount,
        )

      await allowanceResponse.wait()

      // eslint-disable-next-line no-console
      console.log(`Allowance given by tx ${allowanceResponse.hash}`)

      // eslint-disable-next-line no-console
      console.log(
        `Time so far ${(new Date().getTime() - startTime) / 1000} seconds`,
      )

      const response = await crossChainMessenger.depositERC20(
        goerliERC20Token.address,
        mantleTestnetERC20Token.address,
        bigDepositERC20Amount,
      )

      // eslint-disable-next-line no-console
      console.log(`Deposit transaction hash (on L1): ${response.hash}`)

      await response.wait()

      // eslint-disable-next-line no-console
      console.log('Waiting for status to change to RELAYED')

      // eslint-disable-next-line no-console
      console.log(
        `Time so far ${(new Date().getTime() - startTime) / 1000} seconds`,
      )

      await crossChainMessenger.waitForMessageStatus(
        response.hash,
        MessageStatus.RELAYED,
      )

      // eslint-disable-next-line no-console
      console.log(
        `depositERC20 took ${
          (new Date().getTime() - startTime) / 1000
        } seconds\n\n`,
      )
    },
    onError: error => {
      const errorMessage = getErrorMessage(error)

      // eslint-disable-next-line no-console
      console.log('[Deposit ERC20] errorMessage => ', errorMessage)
    },
    onSuccess: () => {
      // eslint-disable-next-line no-console
      console.log('[Deposit ERC20] deposited!')
    },
  })

  const handleDepositERC20 = () => {
    if (connectedChainID !== goerli.id) {
      alert(`You need to switch to ${goerli.name} in order to deposit!`)
      return
    }

    depositERC20Mutate(tokenAmount)
  }

  return (
    <div>
      <h3>Depositing ERC20 ({tokenSymbol}) with the Mantlenetworkio SDK</h3>
      <BasicButton
        onClick={handleDepositERC20}
        disabled={depositERC20MutateIsLoading}
      >
        {`${
          depositERC20MutateIsLoading ? 'Depositing' : 'Deposit'
        } ${tokenAmount} ERC20 (${tokenSymbol})`}
      </BasicButton>
      {depositERC20MutateIsError ? (
        <div>An error occurred: {getErrorMessage(depositERC20MutateError)}</div>
      ) : null}
      {depositERC20MutateIsSuccess ? <div>{tokenAmount} deposited!</div> : null}
    </div>
  )
}

export default MantleDepositERC20
