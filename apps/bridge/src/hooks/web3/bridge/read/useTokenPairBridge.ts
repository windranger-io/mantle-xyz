import {
  Direction,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MANTLE_TOKEN_LIST,
  Token,
} from "@config/constants";

import { useQuery } from "wagmi";
import { useMantleSDK } from "@providers/mantleSDKContext";

function useTokenPairBridge(
  chainId: number,
  selectedToken: {
    [key in Direction]: string;
  },
  destinationToken: {
    [key in Direction]: string;
  },
  tokens: Token[]
) {
  // use the mantle-sdk crossChainMessenger
  const { crossChainMessenger } = useMantleSDK();

  // request the appropriate bridge information from mantlesdk
  const { data: bridgeAddress } = useQuery(
    [
      "GET_BRIDGE_FOR_TOKEN_PAIR",
      {
        chainId,
        destinationToken,
        isConnected: !!crossChainMessenger,
      },
    ],
    async ({ queryKey }) => {
      const type =
        chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw;
      const layer = chainId === L1_CHAIN_ID ? "l1Bridge" : "l2Bridge";
      const keys = queryKey[1] as {
        destinationToken: {
          [key in Direction]: string;
        };
      };
      if (keys.destinationToken && crossChainMessenger) {
        const targetChainID =
          chainId === L1_CHAIN_ID ? L2_CHAIN_ID : L1_CHAIN_ID;

        // get the selection Token
        const selection =
          tokens.find((v) => {
            return selectedToken[type] === v.name && v.chainId === chainId;
          }) || tokens[chainId === L1_CHAIN_ID ? 0 : 1];

        // get the destination Token
        const destination =
          MANTLE_TOKEN_LIST.tokens.find((v) => {
            return (
              selection.logoURI === v.logoURI && v.chainId === targetChainID
            );
          }) || tokens[chainId === L1_CHAIN_ID ? 1 : 0];

        // rearrange the selection/destination
        const l1Address =
          chainId === L1_CHAIN_ID ? selection.address : destination.address;
        const l2Address =
          chainId === L1_CHAIN_ID ? destination.address : selection.address;

        // get the bridge for the given pair
        const bridge =
          selection.extensions.optimismBridgeAddress ||
          (
            await crossChainMessenger?.getBridgeForTokenPair(
              l1Address,
              l2Address
            )
          )?.[layer].address;

        // returns the bridge address
        return bridge;
      }

      return false;
    },
    {
      // cache forever these shouldnt change
      cacheTime: Infinity,
    }
  );

  return {
    bridgeAddress,
  } as {
    bridgeAddress: string;
  };
}

export default useTokenPairBridge;
