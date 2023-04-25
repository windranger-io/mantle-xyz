import { useAccount } from 'wagmi'
import dynamic from 'next/dynamic'

import { MantleSDKProvider } from 'src/providers/mantle-sdk-context'
import { TokenSymbol } from 'src/config/tokens'

const DynamicWagmi = dynamic(() => import('src/components/demos/Wagmi'), {
  ssr: false,
})

const DynamicMantleDepositETH = dynamic(
  () => import('src/components/demos/MantleDepositETH'),
  {
    ssr: false,
  },
)

const DynamicMantleWithdrawERC20 = dynamic(
  () => import('src/components/demos/MantleWithdrawERC20'),
  {
    ssr: false,
  },
)

const DynamicMantleDepositERC20 = dynamic(
  () => import('src/components/demos/MantleDepositERC20'),
  {
    ssr: false,
  },
)

const DynamicMantleWithdrawalsHistory = dynamic(
  () => import('src/components/demos/MantleWithdrawalsHistory'),
  {
    ssr: false,
  },
)

const DynamicMantleDepositsHistory = dynamic(
  () => import('src/components/demos/MantleDepositsHistory'),
  {
    ssr: false,
  },
)

const DEPOSIT_AMOUNT = 0.01

const WITHDRAW_AMOUNT = 0.01

function Demos() {
  const { isConnected } = useAccount()

  return (
    <div
      className="space-y-10"
      style={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}
    >
      <DynamicWagmi />
      {isConnected && (
        <MantleSDKProvider>
          <DynamicMantleDepositETH tokenAmount={DEPOSIT_AMOUNT} />
          <DynamicMantleDepositERC20
            tokenSymbol={TokenSymbol.BIT}
            tokenAmount={DEPOSIT_AMOUNT}
          />
          <DynamicMantleDepositERC20
            tokenSymbol={TokenSymbol.USDC}
            tokenAmount={DEPOSIT_AMOUNT}
          />
          <DynamicMantleWithdrawERC20
            tokenSymbol={TokenSymbol.ETH}
            tokenAmount={WITHDRAW_AMOUNT}
          />
          <DynamicMantleWithdrawERC20
            tokenSymbol={TokenSymbol.BIT}
            tokenAmount={WITHDRAW_AMOUNT}
          />
          <DynamicMantleWithdrawERC20
            tokenSymbol={TokenSymbol.USDC}
            tokenAmount={WITHDRAW_AMOUNT}
          />
          <DynamicMantleWithdrawalsHistory />
          <DynamicMantleDepositsHistory />
        </MantleSDKProvider>
      )}
    </div>
  )
}

export default Demos
