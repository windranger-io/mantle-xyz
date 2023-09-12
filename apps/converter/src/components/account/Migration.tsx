import React, { useContext, useEffect, useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { formatUnits, getAddress } from "ethers/lib/utils";

import StateContext from "@providers/stateContext";

import { L1_CHAIN_ID, L1_BITDAO_TOKEN, CHAINS } from "@config/constants";
import TxLink from "@components/converter/utils/TxLink";
import Pagination from "@components/account/Pagination";
import { GetMigrationHistoryQuery } from "@utils/gql";
import { MigationEntity } from "../../supagraph/types";

const TX_PER_PAGE = 10;
const TX_PER_FETCH = 100;

export default function Migration() {
  const { client } = useContext(StateContext);
  const gqclient = useApolloClient();

  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [history, setHistory] = useState<MigationEntity[]>([]);
  const [page, setPage] = useState<number>(0);

  const pages = useMemo(() => {
    return (historyTotal && Math.ceil(historyTotal / TX_PER_PAGE)) || 0;
  }, [historyTotal]);

  const getHistory = async () => {
    try {
      const { data } = await gqclient.query({
        query: GetMigrationHistoryQuery,
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
          prevState.concat(data.accounts[0].migrations)
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
            <th className="py-4">Transaction</th>
            <th className="py-4">Amount</th>
            <th className="py-4">Gas fee</th>
            <th className="py-4">Refunded</th>
          </tr>
        </thead>
        <tbody className="table-row-group">
          {paginated.map((transaction) => (
            <tr
              className="border-b-[1px] border-stroke-secondary"
              key={transaction.transactionHash}
            >
              <td className="py-4 table-row md:table-cell">
                <div className="pt-4 py-2 md:pt-2">
                  {new Date(
                    (transaction.blockTimestamp as number) * 1000
                  ).toUTCString()}
                </div>
              </td>
              <td className="table-row md:table-cell">
                <div className="py-2">
                  <TxLink
                    chainId={L1_CHAIN_ID}
                    txHash={transaction.transactionHash}
                    className=""
                    asHash
                  />
                </div>
              </td>
              <td className="table-row md:table-cell">
                <div className="py-2">
                  {formatUnits(
                    transaction.amountSwapped,
                    L1_BITDAO_TOKEN?.decimals
                  ).toString()}{" "}
                  {L1_BITDAO_TOKEN?.symbol}
                </div>
              </td>
              <td className="table-row md:table-cell">
                <div className="py-2">
                  {formatUnits(
                    transaction.gasCost,
                    CHAINS[L1_CHAIN_ID]?.nativeCurrency?.decimals
                  ).toString()}{" "}
                  {CHAINS[L1_CHAIN_ID]?.nativeCurrency?.symbol}
                </div>
              </td>
              <td className="table-row md:table-cell">
                <div className="flex pb-4 py-2 flex-row gap-2 items-center md:pb-2">
                  <div className="flex flex-row gap-2 items-center">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="5.5"
                        cy="5.50098"
                        r="5.5"
                        fill={transaction.refunded ? "#54cf24" : "#F26A1D"}
                      />
                    </svg>

                    {transaction.refunded ? (
                      <a
                        className="link hover:text-[#0A8FF6] flex flex-row space-x-2"
                        href={`${CHAINS[L1_CHAIN_ID].blockExplorerUrls}tx/${transaction.refundTx}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Yes
                      </a>
                    ) : (
                      <span>No</span>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} pages={pages} />
    </div>
  );
}
