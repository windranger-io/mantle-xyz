import { gql } from "@apollo/client";

export const GetMigrationHistoryQuery = gql`
  query MigrationsForAccount($account: String!, $skip: Int, $first: Int) {
    account(id: $account) {
      id
      migratedMnt
      migrationCount
      migrations(
        first: $first
        skip: $skip
        orderBy: blockTimestamp
        orderDirection: desc
      ) {
        amountSwapped
        blockTimestamp
        gasCost
        transactionHash
        id
      }
    }
  }
`;
