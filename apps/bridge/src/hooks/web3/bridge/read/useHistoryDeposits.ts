import { useQuery } from "wagmi";

export type Deposit = {
  l1_token: string;
  l2_token: string;
  l1_hash: string;
  l2_hash: string;
  amount: string;
  transactionHash: string;
  blockTimestamp: number;
  status: string;
};
const ZERO_TX =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function useHistoryDeposits(
  client: { address?: string | undefined },
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
        console.log("deposit res", data);
        const dataItems =
          data &&
          data.Records.map((record: any) => {
            let amount = "0";
            if (record.ERC20Amount) {
              amount = BigInt(record.ERC20Amount).toString();
            } else if (record.ETHAmount) {
              amount = BigInt(record.ETHAmount).toString();
            }
            return {
              transactionHash: record.l1TransactionHash,
              l1_token: record.l1TokenAddress,
              l2_token: record.l2TokenAddress,
              l1_hash:
                record.l1TransactionHash === ZERO_TX
                  ? null
                  : record.l1TransactionHash,
              l2_hash:
                record.l2TransactionHash === ZERO_TX
                  ? null
                  : record.l2TransactionHash,
              amount,
              status: record.status && record.status.toString(),
              blockTimestamp: record.timestamp * 1000,
            };
          });
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
        dataItems?.forEach((tx: Deposit) => {
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
        setDeposits(
          [...items].sort((a, b) => b.blockTimestamp - a.blockTimestamp)
        );

        console.log("deposit dataItems: ", dataItems);

        return dataItems;
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
