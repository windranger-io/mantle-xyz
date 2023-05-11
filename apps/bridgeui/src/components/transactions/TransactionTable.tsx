/* eslint-disable react/function-component-definition */
import React from "react";
import { BigNumberish } from "ethers";

type Transaction = {
  l1_token: `0x${string}`;
  l2_token: `0x${string}`;
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
    <div className="table w-full ">
      <div className="table-header-group ">
        <div className="table-row">
          <div className="table-cell ">L1 Token</div>
          <div className="table-cell ">L2 Token</div>
          <div className="table-cell ">Block Timestamp</div>
          <div className="table-cell ">Amount</div>
          <div className="table-cell ">Transaction Hash</div>
          <div className="table-cell ">Status</div>
        </div>
      </div>
      <div className="table-row-group">
        {transactions.map((transaction) => (
          <div className="table-row" key={transaction.transactionHash}>
            <div className="table-cell">{transaction.l1_token}</div>
            <div className="table-cell">{transaction.l2_token}</div>
            <div className="table-cell">
              {transaction.blockTimeStamp.toString()}
            </div>
            <div className="table-cell">{transaction.amount.toString()}</div>
            <div className="table-cell">{transaction.transactionHash}</div>
            <div className="table-cell">{transaction.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTable;
