/* eslint-disable no-underscore-dangle */
import {
  CHAINS_FORMATTED,
  Direction,
  L1_CHAIN_ID,
  TOKEN_ABI,
  Token,
} from "@config/constants";
import { BaseProvider } from "@ethersproject/providers";
import { Contract, BigNumberish, constants, providers } from "ethers";

import { parseUnits, formatUnits } from "ethers/lib/utils.js";
import { useMemo } from "react";

import { useQuery } from "wagmi";

function useAllowanceCheck(
  chainId: number,
  client: { address?: `0x${string}` | undefined },
  bridgeAddress: string | false | undefined,
  selectedToken: { [x: string]: string },
  tokens: Token[],
  connectedProvider: BaseProvider
) {
  // connect to L1 on public gateway but use default rpc for L2
  const provider = useMemo(() => {
    return chainId === L1_CHAIN_ID
      ? new providers.JsonRpcProvider(
          CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
        )
      : connectedProvider;
  }, [chainId, connectedProvider]);

  // fetch the allowance for the selected token on the selected chain
  const { data: allowance, refetch: resetAllowance } = useQuery(
    [
      "ALLOWANCE_CHECK_BY_CHAINID",
      {
        address: client?.address,
        chainId,
        bridgeAddress,
        selectedToken,
        provider: connectedProvider?.network?.name,
      },
    ],
    () => {
      // only run the multicall if we're connected to the correct network
      if (
        client?.address &&
        client?.address !== "0x" &&
        bridgeAddress &&
        connectedProvider?.network?.chainId === chainId &&
        provider
      ) {
        // check that we're using the corrent network before proceeding
        // only run the multicall if we're connected to the correct network
        // direction of the interaction
        const type =
          chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw;

        // get the selection Token
        const selection =
          (tokens &&
            tokens.find((v: { name: any; chainId: number }) => {
              return selectedToken[type] === v.name && v.chainId === chainId;
            })) ||
          tokens[chainId === L1_CHAIN_ID ? 0 : 1];

        // native tokens don't need allowance checks (this whole check needs to be moved into a useEffect to update properly)...
        if (
          client.address &&
          bridgeAddress &&
          // L1 native...
          !(
            chainId === L1_CHAIN_ID &&
            selection.address === "0x0000000000000000000000000000000000000000"
          ) &&
          // L2 native...
          !(
            chainId !== L1_CHAIN_ID &&
            selection.address === "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          )
        ) {
          // produce a contract for the selected contract
          const contract = new Contract(selection.address, TOKEN_ABI, provider);
          // check the allowance the user has allocated to the bridge
          return contract
            ?.allowance(client.address, bridgeAddress)
            .catch(() => {
              // eslint-disable-next-line no-console
              // console.log("Allowance call error:", e);
              return parseUnits(allowance || "0", selection.decimals);
            })
            .then((givenAllowance: BigNumberish) => {
              const newAllowance = formatUnits(
                givenAllowance || "0",
                selection.decimals
              ).toString();
              // only trigger an update if we got a new allowance for selected token
              return newAllowance;
            });
        }
        if (bridgeAddress) {
          return formatUnits(
            constants.MaxUint256,
            selection.decimals
          ).toString();
        }
      }
      return "0";
    },
    {
      enabled: !!provider,
      initialData: "0",
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

  return {
    allowance,
    resetAllowance,
  } as {
    allowance: string;
    resetAllowance: () => void;
  };
}

export default useAllowanceCheck;
