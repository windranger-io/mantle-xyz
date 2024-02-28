import {
  Direction,
  IS_MANTLE_V2,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MANTLE_TOKEN_LIST_URL,
  Token,
} from "@config/constants";
import { constants, ethers } from "ethers";

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
      const isMantleV2 = IS_MANTLE_V2;
      const isETH = destinationToken[type] === "ETH";
      const isMNT = destinationToken[type] === "Mantle";
      if (
        tokenList?.timestamp &&
        selectedToken[type] &&
        destinationToken[type] &&
        crossChainMessenger
      ) {
        if (type === Direction.Deposit && isETH) {
          return crossChainMessenger?.estimateGas
            ?.depositETH(destinationTokenAmount || 0, {
              overrides: { from: client?.address },
            })
            ?.catch((e: Error) => errorHandler(e))
            ?.then((val: string | ethers.BigNumber) => {
              return val.toString();
            });
        }
        if (type === Direction.Withdraw && isETH) {
          return crossChainMessenger?.estimateGas
            ?.withdrawETH(destinationTokenAmount || 0, {
              overrides: { from: client?.address },
            })
            ?.catch((e: Error) => errorHandler(e))
            ?.then((val: string | ethers.BigNumber) => {
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
          if (isMantleV2 && type === Direction.Deposit && isMNT) {
            return crossChainMessenger?.estimateGas
              ?.depositMNT(destinationTokenAmount || 0, {
                overrides: { from: client?.address },
              })
              ?.catch((e: Error) => {
                errorHandler(e);
              })
              ?.then((val: void | ethers.BigNumber) => {
                return val;
              });
          }
          if (isMantleV2 && type === Direction.Withdraw && isMNT) {
            return crossChainMessenger?.estimateGas
              ?.withdrawMNT(destinationTokenAmount || 0, {
                overrides: { from: client?.address },
              })
              ?.catch((e: Error) => errorHandler(e))
              ?.then((val: string | ethers.BigNumber) => {
                return val.toString();
              });
          }
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
              ?.catch((e: Error) => errorHandler(e))
              ?.then((val: string | ethers.BigNumber) => {
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
              ?.catch((e: Error) => errorHandler(e))
              ?.then((val: string | ethers.BigNumber) => {
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
