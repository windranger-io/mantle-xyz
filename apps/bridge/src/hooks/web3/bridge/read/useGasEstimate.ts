import {
  Direction,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MANTLE_TOKEN_LIST_URL,
  Token,
} from "@config/constants";
import { constants } from "ethers";

import { formatUnits, parseUnits } from "ethers/lib/utils.js";

import { useQuery } from "wagmi";
import { useMantleSDK } from "@providers/mantleSDKContext";
import useTokenList from "./useTokenList";

function useGasEstimate(
  chainId: number,
  client: { address?: string | undefined },
  selectedToken: { [x: string]: string },
  destinationToken: { [x: string]: string },
  bridgeAddress: string | false | undefined,
  destinationTokenAmount: string,
  allowance: string
) {
  // pull crossChainMessenger
  const { crossChainMessenger } = useMantleSDK();

  // fetch the list and set into tokenList
  const { tokenList } = useTokenList(MANTLE_TOKEN_LIST_URL);

  // fetch the gas estimate for the selected operation on in the selected direction
  const { data: actualGasFee, refetch: resetGasEstimate } = useQuery(
    [
      "GAS_ESTIMATE",
      {
        chainId,
        address: client?.address,
        selectedToken:
          selectedToken[
            chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw
          ],
        destinationToken:
          destinationToken[
            chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw
          ],
        tokenList: tokenList?.timestamp,
        bridgeAddress,
        destinationTokenAmount,
        allowance,
      },
    ],
    async () => {
      const type =
        chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorHandler = (_e: any) => {
        // invalid state - 0 the gas price
        return formatUnits("0", "gwei")?.toString();
      };

      if (
        tokenList?.timestamp &&
        selectedToken[type] &&
        destinationToken[type] &&
        crossChainMessenger
      ) {
        if (type === Direction.Deposit && destinationToken[type] === "ETH") {
          return crossChainMessenger?.estimateGas
            ?.depositETH(destinationTokenAmount || 0, {
              overrides: { from: client?.address },
            })
            ?.catch((e) => errorHandler(e))
            ?.then((val) => {
              return val.toString();
            });
        }
        if (type === Direction.Withdraw && destinationToken[type] === "ETH") {
          return crossChainMessenger?.estimateGas
            ?.withdrawETH(destinationTokenAmount || 0, {
              overrides: { from: client?.address },
            })
            ?.catch((e) => errorHandler(e))
            ?.then((val) => {
              return val.toString();
            });
        }
        const l1Token: Token =
          tokenList?.tokens.find((v) => {
            return selectedToken[type] === v.name && v.chainId === L1_CHAIN_ID;
          }) || ({} as Token);
        const l2Token: Token =
          tokenList?.tokens.find((v) => {
            return (
              destinationToken[type] === v.name && v.chainId === L2_CHAIN_ID
            );
          }) || ({} as Token);
        // check allocance first - if we don't have enough allowance allocated the gas-estimate will fail
        if (
          allowance &&
          parseUnits(allowance, l1Token?.decimals).gte(
            parseUnits(
              destinationTokenAmount?.toString() || "0",
              l1Token?.decimals
            )
          )
        ) {
          if (type === Direction.Deposit) {
            return crossChainMessenger?.estimateGas
              ?.depositERC20(
                l1Token!.address,
                l2Token!.address,
                parseUnits(
                  destinationTokenAmount?.toString() || "0",
                  l1Token?.decimals
                ),
                { overrides: { from: client?.address } }
              )
              ?.catch((e) => errorHandler(e))
              ?.then((val) => {
                return val.toString();
              });
          }
          if (type === Direction.Withdraw) {
            return crossChainMessenger?.estimateGas
              ?.withdrawERC20(
                l1Token!.address,
                l2Token!.address,
                parseUnits(
                  destinationTokenAmount?.toString() || "0",
                  l2Token?.decimals
                ),
                { overrides: { from: client?.address } }
              )
              ?.catch((e) => errorHandler(e))
              ?.then((val) => {
                return val.toString();
              });
          }
        }
      }

      // not estimating with a good setup show error state
      return formatUnits("0", "gwei")?.toString();
    },
    {
      // show infinity while loading...
      initialData: `${formatUnits(constants.MaxUint256.toString(), "gwei")}`,
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
    actualGasFee,
    resetGasEstimate,
  } as {
    actualGasFee: string;
    resetGasEstimate: () => void;
  };
}

export default useGasEstimate;
