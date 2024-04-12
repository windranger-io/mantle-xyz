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

import { useQuery } from "wagmi";

function useAllowanceCheck(
  chainId: number,
  client: { address?: string | undefined },
  bridgeAddress: string | false | undefined,
  selectedToken: { [x: string]: string },
  tokens: Token[],
  connectedProvider: BaseProvider
) {
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
      // connect to L1 on public gateway but use default rpc for L2
      const provider =
        chainId === L1_CHAIN_ID
          ? new providers.JsonRpcProvider(
              CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.public.http[0]
            )
          : connectedProvider;
      // only run the multicall if we're connected to the correct network
      if (
        client?.address &&
        client?.address !== "0x" &&
        bridgeAddress &&
        provider
      ) {
        // direction of the interaction
        const type =
          chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw;

        // get the selection Token
        const selection =
          (tokens &&
            tokens.find((v: { name: any; chainId: number }) => {
              return selectedToken[type] === v.name && v.chainId === chainId;
            })) ||
          tokens[chainId === L1_CHAIN_ID ? 0 : 1] ||
          {};

        // native tokens don't need allowance checks
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
          const contract =
            selection.address &&
            new Contract(selection.address, TOKEN_ABI, provider);
          // check the allowance the user has allocated to the bridge
          return (
            (selection.address &&
              bridgeAddress &&
              contract.address &&
              contract
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
                })) ||
            "0"
          );
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
    resetAllowance: () => Promise<unknown>;
  };
}

export default useAllowanceCheck;
