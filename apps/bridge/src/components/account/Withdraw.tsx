import React, { useContext, useMemo, useState } from "react";
import StateContext from "@providers/stateContext";

import { Button } from "@mantle/ui";
import { formatUnits, getAddress } from "ethers/lib/utils.js";
import { L2_CHAIN_ID, MANTLE_TOKEN_LIST, Token } from "@config/constants";

import TxLink from "@components/bridge/utils/TxLink";

import Status from "./Status";

const TOKEN_INDEX = MANTLE_TOKEN_LIST.tokens.reduce((indx, token) => {
  // eslint-disable-next-line no-param-reassign
  indx[token.address as string] = token;
  return indx;
}, {} as Record<string, Token>);

export default function Withdraw() {
  const { withdrawals, isLoadingWithdrawals } = useContext(StateContext);

  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    return (
      (withdrawals &&
        withdrawals.length &&
        Math.ceil(withdrawals.length / 10)) ||
      0
    );
  }, [withdrawals]);

  const paginated = useMemo(() => {
    return (withdrawals || [])
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(page * 10, (page + 1) * 10);
  }, [withdrawals, page]);

  return (
    <div>
      <table className="table-auto w-full overflow-x-auto">
        <thead className="text-left collapse md:visible">
          <tr className="border-b-[1px] border-stroke-secondary text-sm ">
            <th className="py-4">Block Timestamp</th>
            <th>Amount</th>
            <th>Transaction Hash</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="table-row-group">
          {isLoadingWithdrawals ? (
            <tr className="border-b-[1px] border-stroke-secondary">
              <td className="py-4" colSpan={4}>
                <div className="w-full flex items-center justify-center">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </td>
            </tr>
          ) : (
            paginated.map((transaction) => (
              <tr
                className="border-b-[1px] border-stroke-secondary"
                key={transaction.transactionHash}
              >
                <td className="py-4 table-row md:table-cell ">
                  <div className="pt-4 py-2 md:pt-2">
                    {new Date(transaction.blockTimestamp * 1000).toUTCString()}
                  </div>
                </td>
                <td className="table-row md:table-cell">
                  <div className="py-2">
                    {formatUnits(
                      transaction.amount,
                      TOKEN_INDEX?.[getAddress(transaction.l2Token)]?.decimals
                    ).toString()}{" "}
                    {TOKEN_INDEX?.[getAddress(transaction.l2Token)]?.symbol}
                  </div>
                </td>
                <td className="table-row md:table-cell">
                  <div className="py-2">
                    <TxLink
                      chainId={L2_CHAIN_ID}
                      txHash={transaction.transactionHash}
                      className=""
                      asHash
                    />
                  </div>
                </td>
                <td className="table-row md:table-cell">
                  <div className="py-2 pb-4 md:pb-2">
                    <Status transactionHash={transaction.transactionHash} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="text-center pt-5">
        <Button
          type="button"
          variant="ghost"
          disabled={page === 0}
          onClick={() => setPage(Math.max(page - 1, 0))}
        >
          {"<"}
        </Button>{" "}
        {!pages ? 0 : page + 1} of {pages}
        <Button
          type="button"
          variant="ghost"
          disabled={page === pages - 1}
          onClick={() => setPage(Math.min(page + 1, pages - 1))}
        >
          {">"}
        </Button>
      </div>
    </div>
  );
}
