import { MessageStatus } from '@mantleio/sdk'
import { useQuery, QueryObserverResult } from '@tanstack/react-query'
import { useErrorHandler, withErrorBoundary } from 'react-error-boundary'

import ErrorFallback from 'src/components/ErrorFallback'
import { useMantleSDK } from 'src/providers/mantle-sdk-context'
import { getChallengePeriod } from 'src/config/mantle-bridge'
import { MANTLE_TESTNET_CHAIN_ID } from 'src/config/mantle-chain'
import { WithdrawalItem, WithdrawalsData } from 'src/types/mantle.d'
import WithdrawalClaimButton from './WithdrawalClaimButton'

enum WithdrawalStatus {
  Pending = 'Pending',
  ChallengePeriod = 'Challenge Period',
  Claim = 'Claim',
  Complete = 'Complete',
}

const GET_MESSAGE_STATUS_QUERY_KEY = 'get-message-status-query-key'

interface Props {
  item: WithdrawalItem
  withdrawalsRefetch: () => Promise<
    QueryObserverResult<WithdrawalsData, unknown>
  >
}

function WithdrawalMessageStatusUI({ item, withdrawalsRefetch }: Props) {
  const { crossChainMessenger } = useMantleSDK()

  const { data, error, isLoading } = useQuery(
    [GET_MESSAGE_STATUS_QUERY_KEY, item.transactionHash],
    async () => {
      if (crossChainMessenger === undefined) {
        throw new Error('Something went wrong!')
      }

      return crossChainMessenger.getMessageStatus(item.transactionHash)
    },
  )
  useErrorHandler(error)

  if (isLoading) {
    return <span>Loading...</span>
  }
  if (data === undefined) {
    throw new Error('Something went wrong!')
  }

  // TODO: configure the argument depending on mantle testnet or mainnet
  const challengePeriod = getChallengePeriod(MANTLE_TESTNET_CHAIN_ID)

  // TODO: double-check https://sdk.mantle.xyz/enums/MessageStatus.html
  // TODO: double-check if we can figure out by parsing `data` against `MessageStatus`
  if (!item.batch) {
    return <span>{WithdrawalStatus.Pending}</span>
  }
  if (Date.now() - 1000 * item.blockTimestamp < challengePeriod) {
    return <span>{WithdrawalStatus.ChallengePeriod}</span>
    // eslint-disable-next-line no-negated-condition
  }
  if (data !== MessageStatus.RELAYED) {
    return (
      <WithdrawalClaimButton
        item={item}
        withdrawalsRefetch={withdrawalsRefetch}
      />
    )
  }
  return <span>{WithdrawalStatus.Complete}</span>
}

export default withErrorBoundary(WithdrawalMessageStatusUI, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload()
  },
})
