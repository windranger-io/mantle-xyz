/* eslint-disable react/function-component-definition */
import React from "react";
import { BigNumberish } from "ethers";
import { toEtherscan } from "@utils/toEtherscan";

import { MantleLink } from "@mantle/ui";

type Transaction = {
  l1_token: string;
  l2_token: string;
  blockTimeStamp: BigNumberish;
  amount: BigNumberish;
  transactionHash: string;
  status: string;
};

type Transactions = Transaction[];

type TransactionTableProps = {
  transactions: Transactions;
};

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
}) => {
  return (
    <table className="table-auto w-full overflow-x-auto">
      <thead className="text-left">
        <tr className="border-b-[1px] border-stroke-secondary text-sm ">
          <th className="py-4">L1 Token</th>
          <th>L2 Token</th>
          <th>Block Timestamp</th>
          <th>Amount</th>
          <th>Transaction Hash</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="table-row-group">
        {transactions.map((transaction) => (
          <tr
            className="border-b-[1px] border-stroke-secondary p-4"
            key={transaction.transactionHash}
          >
            <td className="py-4">{transaction.l1_token}</td>
            <td>{transaction.l2_token}</td>
            <td>{transaction.blockTimeStamp.toString()}</td>
            <td>{transaction.amount.toString()}</td>
            <td>
              <MantleLink
                variant="additionalLinks"
                className="no-underline"
                href={toEtherscan(transaction.transactionHash)}
              >
                {transaction.transactionHash}
              </MantleLink>
            </td>
            <td>{transaction.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionTable;
