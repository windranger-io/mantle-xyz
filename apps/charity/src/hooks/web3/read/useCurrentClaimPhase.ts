import { CHAINS_FORMATTED, L1_CHAIN_ID } from "@config/constants";
import { BigNumber, Contract, providers } from "ethers";
import { useEffect, useState } from "react";

import { useQuery } from "wagmi";

function useCurrentClaimPhase(address: `0x${string}`) {
  const {
    data: activeClaimConditionId,
    isFetching: isFetchingActiveClaimConditionId,
  } = useQuery<BigNumber>(
    [
      "ACTIVE_CLAIM_CONDITION_ID",
      {
        address,
      },
    ],
    async () => {
      const provider = new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      );
      const abi = [
        {
          inputs: [],
          name: "getActiveClaimConditionId",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ];
      const contract = new Contract(address, abi, provider);
      const activeConditionId = await contract.getActiveClaimConditionId();

      return activeConditionId.toString();
    },
    {
      // refetch every 60s or when refetched
      staleTime: 60000,
      refetchInterval: 60000,
      // background refetch stale data
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: true,
    }
  );

  const [currentCondition, setCurrentCondition] = useState(null);

  useEffect(() => {
    const getConditionById = (conditionId: BigNumber) => {
      const provider = new providers.JsonRpcProvider(
        CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
      );
      const abi = [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_conditionId",
              type: "uint256",
            },
          ],
          name: "getClaimConditionById",
          outputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "startTimestamp",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "maxClaimableSupply",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "supplyClaimed",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "quantityLimitPerWallet",
                  type: "uint256",
                },
                {
                  internalType: "bytes32",
                  name: "merkleRoot",
                  type: "bytes32",
                },
                {
                  internalType: "uint256",
                  name: "pricePerToken",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "currency",
                  type: "address",
                },
                {
                  internalType: "string",
                  name: "metadata",
                  type: "string",
                },
              ],
              internalType: "struct IClaimCondition.ClaimCondition",
              name: "condition",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ];
      const contract = new Contract(address, abi, provider);
      contract.getClaimConditionById(conditionId).then((res: any) => {
        setCurrentCondition(res);
      });
    };

    if (
      !isFetchingActiveClaimConditionId &&
      activeClaimConditionId !== undefined
    ) {
      getConditionById(activeClaimConditionId);
    }
  }, [activeClaimConditionId, isFetchingActiveClaimConditionId]);

  return {
    currentCondition,
    activeClaimConditionId,
    isFetchingActiveClaimConditionId,
  };
}

export default useCurrentClaimPhase;
