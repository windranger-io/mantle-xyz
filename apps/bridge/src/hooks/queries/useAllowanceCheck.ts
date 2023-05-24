import { Direction, L1_CHAIN_ID, TOKEN_ABI, Token } from "@config/constants";
import { Network } from "@ethersproject/providers";
import { Contract, BigNumberish, constants } from "ethers";
import { MutableRefObject } from "react";

import { parseUnits, formatUnits } from "ethers/lib/utils.js";

import { useQuery } from "wagmi";

function useAllowanceCheck(
  chainId: number,
  client: { address?: `0x${string}` | undefined },
  bridgeAddress: string | false | undefined,
  selectedToken: { [x: string]: string },
  tokens: Token[],
  multicall: MutableRefObject<
    { network: Network; multicallContract: Contract } | undefined
  >
) {
  // fetch the gas estimate for the selected operation on in the selected direction

  // fetch the allowance for the selected token on the selected chain
  const { data: allowance, refetch: resetAllowance } = useQuery(
    [
      "ALLOWANCE_CHECK",
      {
        address: client?.address,
        chainId,
        bridgeAddress,
        selectedToken,
        multicall: multicall.current?.network.name,
      },
    ],
    () => {
      // only run the multicall if we're connected to the correct network
      if (
        client?.address &&
        client?.address !== "0x" &&
        bridgeAddress &&
        multicall.current?.network.chainId === chainId
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
          const contract = new Contract(
            selection.address,
            TOKEN_ABI,
            multicall.current?.multicallContract.provider
          );
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
