import React from "react";
import TransactionTable from "./TransactionTable";

export default function Withdraw() {
  const transactions = [
    {
      l1_token: "0xabc123",
      l2_token: "0xdef456",
      blockTimeStamp: 1652987432,
      amount: 100,
      transactionHash: "0x789ghi",
      status: "pending",
    },
    {
      l1_token: "0xxyz789",
      l2_token: "0xjkl012",
      blockTimeStamp: 1652987456,
      amount: 50,
      transactionHash: "0x345mno",
      status: "completed",
    },
    {
      l1_token: "0x123abc",
      l2_token: "0x456def",
      blockTimeStamp: 1652987498,
      amount: 200,
      transactionHash: "0xghi789",
      status: "pending",
    },
    // Add more transactions here...
  ];

  return (
    <div>
      <TransactionTable transactions={transactions} />
    </div>
  );
}
