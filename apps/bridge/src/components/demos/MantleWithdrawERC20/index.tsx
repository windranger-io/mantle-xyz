import { MessageStatus } from '@mantleio/sdk'
import { goerli } from 'wagmi'
import { parseUnits } from '@ethersproject/units'
import { useMutation } from '@tanstack/react-query'

import BasicButton from 'src/components/buttons/BasicButton'
import { useMantleSDK } from 'src/providers/mantle-sdk-context'
import {
  MANTLE_TESTNET_CHAIN,
  MANTLE_TESTNET_CHAIN_ID,
} from 'src/config/mantle-chain'
import { TokenSymbol } from 'src/config/tokens'
import useSafeNetwork from 'src/utils/hooks/use-safe-network'
import { getErrorMessage } from 'src/utils/helpers/error-handling'
import { getTokenBySymbol } from 'src/utils/helpers/tokens'

interface Props {
  tokenSymbol: TokenSymbol
  tokenAmount: number
}

// RE: https://mantlenetworkio.github.io/mantle-tutorial/cross-dom-bridge-erc20/
// How to withdraw ERC20 from L2 to L1
function MantleWithdrawERC20({ tokenSymbol, tokenAmount }: Props) {
  const { chain } = useSafeNetwork()

  const connectedChainID = chain.id

  const { crossChainMessenger } = useMantleSDK()

  const goerliERC20Token = getTokenBySymbol(goerli.id, tokenSymbol)

  const mantleTestnetERC20Token = getTokenBySymbol(
    MANTLE_TESTNET_CHAIN_ID,
    tokenSymbol,
  )

  const {
    mutate: withdrawERC20Mutate,
    isLoading: withdrawERC20MutateIsLoading,
    isError: withdrawERC20MutateIsError,
    error: withdrawERC20MutateError,
    isSuccess: withdrawERC20MutateIsSuccess,
  } = useMutation({
    mutationFn: async (withdrawERC20Amount: number) => {
      if (crossChainMessenger === undefined) {
        throw new Error('Something went wrong!')
      }

      // eslint-disable-next-line no-console
      console.log('Withdraw ERC20')

      const startTime = new Date().getTime()

      const bigWithdrawERC20Amount = parseUnits(
        withdrawERC20Amount.toString(),
        mantleTestnetERC20Token.decimals,
      )

      const response = await crossChainMessenger.withdrawERC20(
        goerliERC20Token.address,
        mantleTestnetERC20Token.address,
        bigWithdrawERC20Amount,
      )

      // eslint-disable-next-line no-console
      console.log(`Transaction hash (on L2): ${response.hash}`)

      await response.wait()

      // eslint-disable-next-line no-console
      console.log('Waiting for status to change to IN_CHALLENGE_PERIOD')

      // eslint-disable-next-line no-console
      console.log(
        `Time so far ${(new Date().getTime() - startTime) / 1000} seconds`,
      )

      await crossChainMessenger.waitForMessageStatus(
        response.hash,
        MessageStatus.IN_CHALLENGE_PERIOD,
      )

      // eslint-disable-next-line no-console
      console.log('In the challenge period, waiting for status READY_FOR_RELAY')

      // eslint-disable-next-line no-console
      console.log(
        `Time so far ${(new Date().getTime() - startTime) / 1000} seconds`,
      )

      await crossChainMessenger.waitForMessageStatus(
        response.hash,
        MessageStatus.READY_FOR_RELAY,
      )

      // eslint-disable-next-line no-console
      console.log(
        `withdrawal took ${
          (new Date().getTime() - startTime) / 1000
        } seconds\n\n`,
      )
    },
    onError: error => {
      const errorMessage = getErrorMessage(error)

      // eslint-disable-next-line no-console
      console.log('[Withdraw ERC20] errorMessage => ', errorMessage)
    },
    onSuccess: () => {
      // eslint-disable-next-line no-console
      console.log('[Withdraw ERC20] deposited!')
    },
  })

  const handleWithdrawERC20 = () => {
    if (connectedChainID !== MANTLE_TESTNET_CHAIN.id) {
      alert(
        `You need to switch to ${MANTLE_TESTNET_CHAIN.name} in order to withdraw!`,
      )
      return
    }

    withdrawERC20Mutate(tokenAmount)
  }

  return (
    <div>
      <h3>Withdrawing ERC20 ({tokenSymbol}) with the Mantlenetworkio SDK</h3>
      <BasicButton
        onClick={handleWithdrawERC20}
        disabled={withdrawERC20MutateIsLoading}
      >
        {`${
          withdrawERC20MutateIsLoading ? 'Withdrawing' : 'Withdraw'
        } ${tokenAmount} ERC20 (${tokenSymbol})`}
      </BasicButton>
      {withdrawERC20MutateIsError ? (
        <div>
          An error occurred: {getErrorMessage(withdrawERC20MutateError)}
        </div>
      ) : null}
      {withdrawERC20MutateIsSuccess ? (
        <div>{tokenAmount} withdrawn!</div>
      ) : null}
    </div>
  )
}

export default MantleWithdrawERC20
