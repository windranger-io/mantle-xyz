import { L1_CHAIN_ID, TOKEN_ABI, Token } from "@config/constants";
import { Network } from "@ethersproject/providers";
import { BigNumberish, Contract } from "ethers";
import { MutableRefObject } from "react";

import { callMulticallContract } from "@utils/multicallContract";
import { formatUnits } from "ethers/lib/utils.js";

import { useQuery } from "wagmi";

function useAccountBalances(
  chainId: number,
  client: { address?: `0x${string}` | undefined },
  tokens: Token[],
  multicall: MutableRefObject<
    { network: Network; multicallContract: Contract } | undefined
  >,
  setIsLoadingBalances: (arg: boolean) => void
) {
  // perform a multicall on the given network to get all token balances for user
  const {
    data: balances,
    refetch: resetBalances,
    isFetching: isFetchingBalances,
    isRefetching: isRefetchingBalances,
  } = useQuery<{
    [key: string]: BigNumberish;
  }>(
    [
      "BALANCES_FOR_ADDRESS_ON_CHAINID_TEST",
      {
        address: client?.address,
        chainId,
        multicall: multicall.current?.network.name,
      },
    ],
    async () => {
      // only run the multicall if we're connected to the correct network
      if (
        client?.address &&
        client?.address !== "0x" &&
        multicall.current?.network.chainId === chainId
      ) {
        // filter any native tokens from the selection
        const filteredTokens = tokens.filter(
          (v: { address: string }) =>
            [
              "0x0000000000000000000000000000000000000000",
              "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
            ].indexOf(v.address) === -1
        );

        // produce a set of balanceOf calls to check users balance against every token
        const calls = filteredTokens.map((token: { address: string }) => {
          return {
            target: token.address as `0x${string}`,
            contract: new Contract(
              token.address,
              TOKEN_ABI,
              multicall.current?.multicallContract.provider
            ),
            fns: [
              {
                fn: "balanceOf",
                args: [client?.address as string],
              },
            ],
          };
        });

        console.log({ calls });
        // run all calls...
        const responses = await callMulticallContract(
          multicall.current.multicallContract,
          calls
        );
        const newBalances = responses.reduce((fillBalances, value, key) => {
          // copy of the obj
          const newFillBalances = { ...fillBalances };
          // set the balance value in to the token details
          newFillBalances[filteredTokens[key].address] = formatUnits(
            value?.toString() || "0",
            18
          );

          return newFillBalances;
        }, {} as Record<string, string>);

        // update the displayed balances
        const finalBalances = {
          ...newBalances,
          // place the native token balances
          ...(chainId === L1_CHAIN_ID
            ? {
                "0x0000000000000000000000000000000000000000":
                  (client.address &&
                    formatUnits(
                      (await multicall.current.multicallContract.provider.getBalance(
                        client.address!
                      )) || "0",
                      18
                    )) ||
                  "0",
              }
            : {
                "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000":
                  (client.address &&
                    formatUnits(
                      (await multicall.current.multicallContract.provider.getBalance(
                        client.address!
                      )) || "0",
                      18
                    )) ||
                  "0",
              }),
        };

        // do this in next redraw
        setTimeout(() => {
          // done loading
          setIsLoadingBalances(false);
        });

        // return
        return finalBalances;
      }
      // clear the balances
      return {};
    },
    {
      initialData: {},
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
    balances,
    resetBalances,
    isFetchingBalances,
    isRefetchingBalances,
  } as {
    balances: Record<string, string>;
    resetBalances: () => void;
    isFetchingBalances: boolean;
    isRefetchingBalances: boolean;
  };
}

export default useAccountBalances;
