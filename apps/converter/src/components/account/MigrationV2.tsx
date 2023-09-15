import { useApolloClient } from "@apollo/client";
import { getAddress } from "ethers/lib/utils";
import { useContext, useEffect, useMemo, useState } from "react";

import StateContext from "@providers/stateContext";

import Pagination from "@components/account/Pagination";
import { GetMigrationV2HistoryQuery } from "@utils/gql";
import { MigationEntity } from "../../supagraph/types";
import TxRow from "./TxRow";

const TX_PER_PAGE = 10;
const TX_PER_FETCH = 100;

export default function MigrationV2() {
  const { client } = useContext(StateContext);
  const gqclient = useApolloClient();

  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [history, setHistory] = useState<MigationEntity[]>([]);
  const [historyPending, setHistoryPending] = useState<MigationEntity[]>([]);
  const [page, setPage] = useState<number>(0);

  const pages = useMemo(() => {
    return (historyTotal && Math.ceil(historyTotal / TX_PER_PAGE)) || 0;
  }, [historyTotal]);

  const getHistory = async () => {
    try {
      const { data } = await gqclient.query({
        query: GetMigrationV2HistoryQuery,
        variables: {
          account: getAddress(client.address || ""),
          skip: history.length,
          first: TX_PER_FETCH,
        },
        // disable apollo cache to force new fetch call every invoke
        fetchPolicy: "no-cache",
        // use next cache to store the responses for 30s
        context: {
          fetchOptions: {
            next: { revalidate: 30 },
          },
        },
      });

      if (data.accounts) {
        setHistoryTotal(data.accounts[0].migrationCount);
        setHistory((prevState) =>
          prevState.concat(data.accounts[0].migrationsV2)
        );
        setHistoryPending((prevState) =>
          prevState.concat(data.accounts[0].pendingMigrationsV2)
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("Failed to get tx history", err);
    }
  };

  useEffect(() => {
    // fetch first few data when getting user's address
    if (client?.address) {
      getHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.address]);

  // pre-fetch when reaching the end of the current fetched list
  useEffect(() => {
    if (
      page > 0 &&
      page === history.length / TX_PER_PAGE - 1 &&
      history.length < historyTotal
    ) {
      getHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, history, historyTotal]);

  const paginated = useMemo(() => {
    return history.slice(page * TX_PER_PAGE, (page + 1) * TX_PER_PAGE);
  }, [history, page]);

  return (
    <div>
      <table className="table-auto w-full overflow-x-auto">
        <thead className="text-left collapse md:visible hidden md:table-header-group">
          <tr className="border-b-[1px] border-stroke-secondary text-sm ">
            <th className="py-4">Block Timestamp</th>
            <th className="py-4">Requested Tx</th>
            <th className="py-4">Migration Tx</th>
            <th className="py-4">Amount</th>
            <th className="py-4">Status</th>
          </tr>
        </thead>
        <tbody className="table-row-group">
          {historyPending.map((transaction) => (
            <TxRow
              key={transaction.transactionHash}
              approvalTxHash={transaction.transactionHash}
              migrationTxHash={undefined}
              blockTimestamp={transaction.blockTimestamp}
              amount={transaction.amountApproved}
              status={transaction.status}
            />
          ))}
          {paginated.map((transaction) => (
            <TxRow
              key={transaction.transactionHash}
              approvalTxHash={transaction.approvalTx}
              migrationTxHash={transaction.transactionHash}
              blockTimestamp={transaction.blockTimestamp}
              amount={transaction.amountSwapped}
              status={transaction.status}
            />
          ))}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} pages={pages} />
    </div>
  );
}
