import { gql } from "@apollo/client";

export const GetMigrationHistoryQuery = gql`
  query MigrationsForAccount($account: ID!, $skip: Int, $first: Int) {
    accounts(where: { id: $account }) {
      id
      migratedMnt
      migrationCount
      migrations(
        first: $first
        skip: $skip
        orderBy: blockTimestamp
        orderDirection: desc
      ) {
        id
        amountSwapped
        blockTimestamp
        transactionHash
        gasCost
        refunded
        refundTx
      }
    }
  }
`;

export const GetMigrationV2HistoryQuery = gql`
  query MigrationsV2ForAccount($account: ID!, $skip: Int, $first: Int) {
    accounts(where: { id: $account }) {
      id
      migratedMnt
      migrationCount
      migrationsV2(
        first: $first
        skip: $skip
        orderBy: blockTimestamp
        orderDirection: desc
      ) {
        id
        status
        amountSwapped
        gasCost
        refunded
        refundTx
        blockTimestamp
        transactionHash
        approvedBy
        approvalTx
      }
      pendingMigrationsV2(
        where: { status_not: "COMPLETE" }
        first: 10
        orderBy: blockTimestamp
        orderDirection: desc
      ) {
        id
        status
        amountSwapped
        amountApproved
        gasCost
        refunded
        refundTx
        blockTimestamp
        transactionHash
      }
    }
  }
`;
