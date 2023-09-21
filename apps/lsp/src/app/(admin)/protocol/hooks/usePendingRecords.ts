import { GRAPHQL_URL } from "@config/constants";
import { request, gql } from "graphql-request";
import { useQuery } from "wagmi";

interface PendingResponse {
  pendingOracleRecord: PendingOracleRecord;
}

export type PendingOracleRecord = {
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

const getPendingRecordQuery = gql`
  query getPendingRecord($id: String!) {
    pendingOracleRecord(id: $id) {
      id
      reason
      bound
      value
      updateStartBlock
      updateEndBlock
      cumulativeProcessedDepositAmount
      cumulativeNumValidatorsFullyWithdrawn
      currentNumValidatorsWithBalance
      currentTotalValidatorBalance
      windowWithdrawnPrincipalAmount
      windowWithdrawnRewardAmount
    }
  }
`;

const getPendingRecord = (api: string) => {
  return async (): Promise<PendingOracleRecord> => {
    const result = await request<PendingResponse>(api, getPendingRecordQuery, {
      id: "pending",
    });
    return result.pendingOracleRecord;
  };
};

export function usePendingOracleRecord() {
  const { data, isLoading } = useQuery(
    ["pending-oracle-record"],
    getPendingRecord(GRAPHQL_URL),
    {
      refetchInterval: 30000,
    }
  );
  return { data, isLoading };
}
