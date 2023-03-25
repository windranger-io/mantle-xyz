import * as React from 'react'
import { CrossChainMessenger } from '@mantleio/sdk'
import { useProvider } from 'wagmi'
import { erc20ABI } from '@wagmi/core'
import { Contract } from '@ethersproject/contracts'
import { formatUnits } from '@ethersproject/units'

import { MANTLE_TESTNET_CHAIN_ID } from 'src/config/mantle-chain'
import { getErrorMessage } from 'src/utils/helpers/error-handling'
import { getTokenBySymbol } from 'src/utils/helpers/tokens'
import { TokenSymbol } from 'src/config/tokens'

const mantleTestnetETH = getTokenBySymbol(
  MANTLE_TESTNET_CHAIN_ID,
  TokenSymbol.ETH,
)

const useReportBalances = (crossChainMessenger: CrossChainMessenger) => {
  const mantleTestnetProvider = useProvider({
    chainId: MANTLE_TESTNET_CHAIN_ID,
  })

  React.useEffect(() => {
    try {
      if (!crossChainMessenger) return

      // TODO: this is redundant thanks to `useBalance` but worth checking if the SDK works as expected
      const reportBalances = async () => {
        if (crossChainMessenger === undefined) {
          throw new Error('Something went wrong!')
        }

        const l1Balance = await crossChainMessenger.l1Signer.getBalance()
        const ETH = new Contract(
          mantleTestnetETH.address,
          erc20ABI,
          mantleTestnetProvider,
        )
        const l2Balance = await ETH.balanceOf(
          crossChainMessenger.l2Signer.getAddress(),
        )

        // eslint-disable-next-line max-len, no-console
        console.log(
          `On L1:${formatUnits(
            l1Balance,
            mantleTestnetETH.decimals,
          )} On L2:${formatUnits(l2Balance, mantleTestnetETH.decimals)}`,
        )
      }

      reportBalances()
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error)

      // eslint-disable-next-line no-console
      console.log('[useReportBalances] errorMessage => ', errorMessage)
    }
  }, [crossChainMessenger, mantleTestnetProvider])
}

export default useReportBalances
