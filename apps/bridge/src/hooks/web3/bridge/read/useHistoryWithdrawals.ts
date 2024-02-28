import { useQuery } from "wagmi";

export type Withdrawal = {
  transactionHash: string;
  l1_token: string;
  l2_token: string;
  l1_hash: string;
  l2_hash: string;
  amount: string;
  status: string;
  blockTimestamp: number;
  l1_prove_tx_hash?: string;
  l1_finalize_tx_hash?: string;
  time_left?: number;
};
const ZERO_TX =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function useHistoryWithdrawals(
  client: { address?: string | undefined },
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
        console.log("withdraw res", data);
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
              transactionHash: record.l2TransactionHash,
              l1_token: record.l1TokenAddress,
              l2_token: record.l2TokenAddress,
              l1_hash:
                record.l1FinalizeTxHash === ZERO_TX
                  ? null
                  : record.l1FinalizeTxHash,
              l2_hash:
                record.l2TransactionHash === ZERO_TX
                  ? null
                  : record.l2TransactionHash,
              l1_prove_tx_hash:
                record.l1ProveTxHash === ZERO_TX ? null : record.l1ProveTxHash,
              l1_finalize_tx_hash:
                record.l1FinalizeTxHash === ZERO_TX
                  ? null
                  : record.l1FinalizeTxHash,
              amount,
              status: record.status.toString(),
              blockTimestamp: record.timestamp * 1000,
              time_left: record.timeLeft,
            };
          });
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
        dataItems?.forEach((tx: Withdrawal) => {
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
          [...items].sort((a, b) => b.blockTimestamp - a.blockTimestamp)
        );

        console.log("withdraw dataItems: ", dataItems);

        // we're not using this response directly atm
        return dataItems;
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
