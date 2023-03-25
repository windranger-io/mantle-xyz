import { formatUnits } from '@ethersproject/units'
import { QueryObserverResult } from '@tanstack/react-query'
import clsx from 'clsx'

import { MANTLE_TESTNET_CHAIN } from 'src/config/mantle-chain'
import shortenAddress from 'src/utils/helpers/shorten-address'
import { getTokenByAddress } from 'src/utils/helpers/tokens'
import { WithdrawalItem, WithdrawalsData } from 'src/types/mantle.d'
import WithdrawalMessageStatusUI from './WithdrawalMessageStatusUI'

interface Props {
  item: WithdrawalItem
  withdrawalsRefetch: () => Promise<
    QueryObserverResult<WithdrawalsData, unknown>
  >
}

function WithdrawalItemUI({ item, withdrawalsRefetch }: Props) {
  const timeLabel = new Date(
    Number(item.blockTimestamp) * 1000,
  ).toLocaleString()
  const tokenAddress = item.l2Token
  const token = getTokenByAddress(MANTLE_TESTNET_CHAIN.id, tokenAddress)
  const amountLabel = `${formatUnits(item.amount, token.decimals)} ${
    token.symbol
  }`
  const txHashLabel = shortenAddress(item.transactionHash)

  return (
    <li className={clsx('flex', 'items-center', 'space-x-10')}>
      <span>{timeLabel}</span>
      <span>{amountLabel}</span>
      <span>{txHashLabel}</span>
      <WithdrawalMessageStatusUI
        item={item}
        withdrawalsRefetch={withdrawalsRefetch}
      />
    </li>
  )
}

export default WithdrawalItemUI
