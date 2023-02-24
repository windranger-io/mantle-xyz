type WithdrawalItem = {
  LogIndex: number;
  amount: string;
  batch: {
    blockHash: string;
    blockNumber: number;
    extraData: string;
    index: number;
    prevTotal: number;
    root: string;
    size: number;
  };
  blockNumber: number;
  blockTimestamp: number;
  data: unknown;
  from: string;
  guid: string;
  is_finalized: boolean;
  is_relayed: boolean;
  is_sent: boolean;
  is_withdraw_bit: boolean;
  is_withdraw_eth: boolean;
  l1Token: {
    address: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  l2Token: string;
  ready_for_relay: boolean;
  to: string;
  transactionHash: string;
};

type WithdrawalsData = {
  IsSuccess: boolean;
  items: Array<WithdrawalItem>;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

export type {
  WithdrawalItem,
  WithdrawalsData
};
