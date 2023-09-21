import { GRAPHQL_URL } from "@config/constants";
import { NodeOperator } from "@util/util";
import { request, gql } from "graphql-request";
import { useQuery } from "wagmi";

interface ValidatorsResponse {
  validators: ValidatorDeposit[];
  validatorCount: { count: number };
}

export type ValidatorDeposit = {
  id: string;
  nodeOperatorId: NodeOperator;
  depositedAt: Date;
  depositBlock: number;
};

const getValidatorsQuery = gql`
  query recentValidators(
    $orderBy: String
    $orderDirection: String
    $limit: Int!
    $countId: String!
  ) {
    validators(
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $limit
    ) {
      id
      nodeOperatorId
      depositedAt
      depositBlock
    }
    validatorCount(id: $countId) {
      count
    }
  }
`;

const getValidators = (api: string, count: number) => {
  return async (): Promise<ValidatorsResponse> => {
    const result = await request<ValidatorsResponse>(api, getValidatorsQuery, {
      orderBy: "depositedAt",
      orderDirection: "desc",
      countId: "singleton",
      limit: count,
    });
    const vals = result.validators.map((v) => {
      return {
        ...v,
        depositedAt: new Date((v.depositedAt as unknown as number) * 1000),
      };
    });
    return {
      validators: vals,
      validatorCount: result.validatorCount,
    };
  };
};

export function useRecentValidators(count = 10) {
  const { data, isLoading } = useQuery(
    ["recent-validators"],
    getValidators(GRAPHQL_URL, count),
    {
      refetchInterval: 30000,
    }
  );
  return { data, isLoading };
}
