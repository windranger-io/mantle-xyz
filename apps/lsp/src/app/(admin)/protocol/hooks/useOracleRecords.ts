import { GRAPHQL_URL } from "@config/constants";
import { request, gql } from "graphql-request";
import { useQuery } from "wagmi";

interface OracleRecordsResponse {
  oracleRecords: OracleRecord[];
}

export type OracleRecord = {
  id: number;
  updateStartBlock: number;
  updateEndBlock: number;
  cumulativeProcessedDepositAmount: bigint;
  cumulativeNumValidatorsFullyWithdrawn: number;
  currentNumValidatorsWithBalance: number;
  currentTotalValidatorBalance: bigint;
  windowWithdrawnPrincipalAmount: bigint;
  windowWithdrawnRewardAmount: bigint;
  wasModified: boolean;
  receivedAt: number;
};

const getOracleRecordsQuery = gql`
  query recentOracleRecords(
    $orderBy: String
    $orderDirection: String
    $skip: Int
  ) {
    oracleRecords(
      orderBy: $orderBy
      orderDirection: $orderDirection
      skip: $skip
    ) {
      id
      updateStartBlock
      updateEndBlock
      cumulativeProcessedDepositAmount
      cumulativeNumValidatorsFullyWithdrawn
      currentNumValidatorsWithBalance
      currentTotalValidatorBalance
      windowWithdrawnPrincipalAmount
      windowWithdrawnRewardAmount
      wasModified
      receivedAt
    }
  }
`;

const getOracleRecords = (api: string) => {
  return async (): Promise<OracleRecord[]> => {
    const result = await request<OracleRecordsResponse>(
      api,
      getOracleRecordsQuery,
      {
        orderBy: "id",
        orderDirection: "desc",
        skip: 0,
      }
    );
    return result.oracleRecords;
  };
};

export function useOracleRecords() {
  const { data, isLoading } = useQuery(
    ["oracle-records"],
    getOracleRecords(GRAPHQL_URL),
    {
      refetchInterval: 30000,
    }
  );
  return { data, isLoading };
}
