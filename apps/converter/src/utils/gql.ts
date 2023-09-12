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
