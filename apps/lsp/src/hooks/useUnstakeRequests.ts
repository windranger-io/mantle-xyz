import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import {
  Address,
  useAccount,
  useContractReads,
  useNetwork,
  useQuery,
} from "wagmi";

type UnstakeRequest = {
  id: number;
  requestedAt: Date;
  ethAmountWei: bigint;
  mEthLockedWei: bigint;
  claimState?: ClaimState;
};

type ClaimState = {
  isFinalized: boolean;
  amountFilledWei: bigint;
};

interface RequestsResponse {
  data: {
    unstakeRequests: UnstakeRequest[];
  };
}

const getUnclaimedRequestsQuery = `
  query unclaimedRequests($address: String!) {
    unstakeRequests(where: { requester: $address, isClaimed: false }) {
      id
      requestedAt
      ethAmountWei
      mEthLockedWei
    }
  }
`;

const getUnstakeRequests = async (api: string, address: Address) => {
  const data = await fetch(api, {
    method: "POST",
    body: JSON.stringify({
      query: getUnclaimedRequestsQuery,
      variables: {
        address: address.toLowerCase(),
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const out = (await data.json()) as RequestsResponse;
  return out.data.unstakeRequests;
};

function useUnstakeRequests() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const shouldFetch = typeof address === "string" && Boolean(chain?.id);
  return useQuery(
    ["UNSTAKE_REQUESTS", address],
    async () => {
      return getUnstakeRequests(
        "https://indexer-goerli.up.railway.app/",
        address!
      );
    },
    {
      refetchInterval: 12000,
      enabled: shouldFetch,
    }
  );
}

const idToRequestCall = (id: number) => {
  return {
    ...contracts[CHAIN_ID][ContractName.Staking],
    functionName: "unstakeRequestInfo",
    args: [id],
  };
};

export default function usePendingUnstakeRequests() {
  const requests = useUnstakeRequests();

  const requestIDs = requests.data?.map((r) => r.id);
  const calls = requestIDs?.map(idToRequestCall);

  const claimState = useContractReads({
    enabled: Boolean(
      !requests.isLoading && requests.data && requests.data.length > 0
    ),
    contracts: calls,
    watch: true,
  });

  let result: UnstakeRequest[] = [];
  if (requests.data && claimState.data) {
    result = requests.data.map((r, i) => {
      const stateRes = claimState.data![i];
      if (stateRes.status !== "success") {
        return r;
      }
      const [isFinalized, amountFilledWei] = stateRes.result as [
        boolean,
        bigint
      ];
      return {
        ...r,
        claimState: {
          isFinalized,
          amountFilledWei,
        },
      };
    });
  }

  return {
    isLoading: requests.isLoading || claimState.isLoading,
    data: result,
    refetch: () => {
      requests.refetch();
    },
  };
}
