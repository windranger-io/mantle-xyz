import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useErrorHandler, withErrorBoundary } from 'react-error-boundary'

import ErrorFallback from 'src/components/ErrorFallback'
import {
  MANTLE_BRIDGE_BACKEND_API_URL_PREFIX,
  WITHDRAWALS_LABEL,
} from 'src/config/links'
import { QUERY_PARAMETERS } from 'src/utils/constants/links'
import { WithdrawalsData } from 'src/types/mantle.d'
import WithdrawalItemUI from './WithdrawalItemUI'

// TODO: pagination based
const OFFSET = 0
const LIMIT = 20

const queryParameters = new URLSearchParams({
  [QUERY_PARAMETERS.OFFSET]: OFFSET.toString(),
  [QUERY_PARAMETERS.LIMIT]: LIMIT.toString(),
})

function MantleWithdrawalHistory() {
  const { address } = useAccount()

  if (address === undefined) {
    throw new Error('Something went wrong!')
  }

  const mantleBridgeBackendApiUrl = `${MANTLE_BRIDGE_BACKEND_API_URL_PREFIX}/${WITHDRAWALS_LABEL}/${address}?${queryParameters.toString()}`

  const {
    data: withdrawalsData,
    error: withdrawalsError,
    isLoading: withdrawalsIsLoading,
    refetch: withdrawalsRefetch,
  } = useQuery([mantleBridgeBackendApiUrl], async () => {
    const response = await fetch(mantleBridgeBackendApiUrl)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data: WithdrawalsData = await response.json()

    return data
  })
  useErrorHandler(withdrawalsError)

  if (withdrawalsIsLoading) {
    return <div>Loading...</div>
  }
  if (withdrawalsData === undefined) {
    throw new Error('Something went wrong!')
  }

  return (
    <div>
      <h3>Withdrawals history</h3>
      <ul className="space-y-2">
        {withdrawalsData.items.map(item => (
          <WithdrawalItemUI
            key={item.guid}
            item={item}
            withdrawalsRefetch={withdrawalsRefetch}
          />
        ))}
      </ul>
    </div>
  )
}

export default withErrorBoundary(MantleWithdrawalHistory, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload()
  },
})
