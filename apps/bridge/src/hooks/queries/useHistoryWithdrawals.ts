import { useQuery } from "wagmi";

export type Withdrawal = {
  status: string;
  l1Token: {
    address: string;
  };
  l2Token: string;
  amount: string;
  transactionHash: string;
  ready_for_relay: boolean;
  is_finalized: boolean;
  blockTimestamp: number;
  blockNumber: number;
};

function useHistoryWithdrawals(
  client: { address?: `0x${string}` | undefined },
  withdrawalsUrl: string,
  withdrawals: Withdrawal[] | undefined,
  setWithdrawals: (val: Withdrawal[]) => void
) {
  // query to fetch withdrawals history in batches of HISTORY_ITEMS_PER_PAGE
  const { refetch: refetchWithdrawalsPage, isLoading: isLoadingWithdrawals } =
    useQuery(
      ["HISTORICAL_WITHDRAWALS", { withdrawalsUrl }],
      async () => {
        const res = await fetch(withdrawalsUrl);
        const data = await res.json();
        const items: Withdrawal[] = [...(withdrawals || [])];
        const uniques: Record<string, Withdrawal> = (withdrawals || []).reduce(
          (txs: Record<string, Withdrawal>, tx: Withdrawal) => {
            return {
              ...txs,
              [tx.transactionHash]: tx,
            };
          },
          {} as Record<string, Withdrawal>
        );

        // update old entries and place new ones
        data.items?.forEach((tx: Withdrawal) => {
          if (!uniques[tx.transactionHash]) {
            items.push({
              ...tx,
              status: tx.status || "",
            });
          } else {
            const index = items.findIndex(
              (i) => i.transactionHash === tx.transactionHash
            );
            if (index !== -1) {
              // update the item in place
              items[index] = {
                ...tx,
                status: tx.status || "",
              };
            } else {
              items.push({
                ...tx,
                status: tx.status || "",
              });
            }
          }
        });

        // set the new items
        setWithdrawals(
          [...items].sort((a, b) => b.blockNumber - a.blockNumber)
        );

        // we're not using this response directly atm
        return data.items;
      },
      {
        enabled: !!client.address && !!withdrawalsUrl,
        cacheTime: 30000,
      }
    );

  return {
    isLoadingWithdrawals,
    refetchWithdrawalsPage,
  } as {
    isLoadingWithdrawals: boolean;
    refetchWithdrawalsPage: () => void;
  };
}

export default useHistoryWithdrawals;
