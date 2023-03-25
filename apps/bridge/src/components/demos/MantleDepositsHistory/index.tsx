import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useErrorHandler, withErrorBoundary } from 'react-error-boundary'

import ErrorFallback from 'src/components/ErrorFallback'
import {
  MANTLE_BRIDGE_BACKEND_API_URL_PREFIX,
  DEPOSITS_LABEL,
} from 'src/config/links'
import { QUERY_PARAMETERS } from 'src/utils/constants/links'

// TODO: pagination based
const OFFSET = 0
const LIMIT = 20

const queryParameters = new URLSearchParams({
  [QUERY_PARAMETERS.OFFSET]: OFFSET.toString(),
  [QUERY_PARAMETERS.LIMIT]: LIMIT.toString(),
})

type DepositsData = {
  IsSuccess: boolean
  items: Array<{
    LogIndex: number
    amount: string
    blockNumber: number
    blockTimestamp: number
    data: unknown
    from: string
    guid: string
    is_deposit_bit: boolean
    is_deposit_eth: boolean
    l1Token: {
      address: string
      decimals: number
      name: string
      symbol: string
    }
    l2Token: string
    to: string
    transactionHash: string
  }>
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

function MantleDepositsHistory() {
  const { address } = useAccount()

  if (address === undefined) {
    throw new Error('Something went wrong!')
  }

  const mantleBridgeBackendApiUrl = `${MANTLE_BRIDGE_BACKEND_API_URL_PREFIX}/${DEPOSITS_LABEL}/${address}?${queryParameters.toString()}`

  const {
    data: depositsData,
    error: depositsError,
    isLoading: depositsIsLoading,
  } = useQuery([mantleBridgeBackendApiUrl], async () => {
    const response = await fetch(mantleBridgeBackendApiUrl)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data: DepositsData = await response.json()

    return data
  })
  useErrorHandler(depositsError)

  if (depositsIsLoading) {
    return <div>Loading...</div>
  }
  if (depositsData === undefined) {
    throw new Error('Something went wrong!')
  }

  return <div>MantleDepositsHistoryDemo</div>
}

export default withErrorBoundary(MantleDepositsHistory, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload()
  },
})
