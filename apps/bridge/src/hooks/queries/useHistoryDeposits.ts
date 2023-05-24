import { useQuery } from "wagmi";

export type Deposit = {
  l1Token: {
    address: string;
  };
  l2Token: string;
  amount: string;
  transactionHash: string;
  blockTimestamp: number;
  blockNumber: number;
};

function useHistoryDeposits(
  client: { address?: `0x${string}` | undefined },
  depositsUrl: string,
  deposits: Deposit[] | undefined,
  setDeposits: (val: Deposit[]) => void
) {
  // query to fetch deposit history in batches of HISTORY_ITEMS_PER_PAGE
  const { refetch: refetchDepositsPage, isLoading: isLoadingDeposits } =
    useQuery(
      ["HISTORICAL_DEPOSITS", { depositsUrl }],
      async () => {
        const res = await fetch(depositsUrl);
        const data = await res.json();
        const items: Deposit[] = [...(deposits || [])];
        const uniques: Record<string, Deposit> = (deposits || []).reduce(
          (txs: Record<string, Deposit>, tx: Deposit) => {
            return {
              ...txs,
              [tx.transactionHash]: tx,
            };
          },
          {} as Record<string, Deposit>
        );

        // update old entries and place new ones
        data.items?.forEach((tx: Deposit) => {
          if (!uniques[tx.transactionHash]) {
            items.push(tx);
          } else {
            const index = items.findIndex(
              (i) => i.transactionHash === tx.transactionHash
            );
            if (index !== -1) {
              // update the item in place
              items[index] = tx;
            } else {
              items.push(tx);
            }
          }
        });

        // set the new items
        setDeposits([...items].sort((a, b) => b.blockNumber - a.blockNumber));

        return data.items;
      },
      { enabled: !!client.address && !!depositsUrl, cacheTime: 30000 }
    );

  return {
    isLoadingDeposits,
    refetchDepositsPage,
  } as {
    isLoadingDeposits: boolean;
    refetchDepositsPage: () => void;
  };
}

export default useHistoryDeposits;
