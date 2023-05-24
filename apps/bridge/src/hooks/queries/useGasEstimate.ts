import {
  Direction,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MANTLE_TOKEN_LIST,
} from "@config/constants";
import { constants } from "ethers";

import { formatUnits, parseUnits } from "ethers/lib/utils.js";

import { useQuery } from "wagmi";
import { useMantleSDK } from "@providers/mantleSDKContext";

function useGasEstimate(
  chainId: number,
  client: { address?: `0x${string}` | undefined },
  selectedToken: { [x: string]: string },
  destinationToken: { [x: string]: string },
  bridgeAddress: string | false | undefined,
  destinationTokenAmount: string
) {
  // pull crossChainMessenger
  const { crossChainMessenger } = useMantleSDK();

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
        bridgeAddress,
        destinationTokenAmount,
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
        const l1Token = MANTLE_TOKEN_LIST.tokens.find((v) => {
          return selectedToken[type] === v.name && v.chainId === L1_CHAIN_ID;
        });
        const l2Token = MANTLE_TOKEN_LIST.tokens.find((v) => {
          return destinationToken[type] === v.name && v.chainId === L2_CHAIN_ID;
        });
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
