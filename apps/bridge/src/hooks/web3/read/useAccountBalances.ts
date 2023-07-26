import {
  CHAINS_FORMATTED,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MULTICALL_CONTRACTS,
  TOKEN_ABI,
  Token,
} from "@config/constants";
import { BigNumberish, Contract, providers } from "ethers";

import {
  callMulticallContract,
  getMulticallContract,
} from "@utils/multicallContract";
import { formatUnits } from "ethers/lib/utils.js";

import { useQuery } from "wagmi";

function useAccountBalances(
  chainId: number,
  client: { address?: string | undefined },
  tokens: Token[],
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
      "ADDRESS_BALANCES_FOR_ON_CHAINID",
      {
        address: client?.address,
        chainId,
      },
    ],
    async () => {
      // connect to L1 on public gateway but use default rpc for L2
      const provider = new providers.JsonRpcProvider(
        CHAINS_FORMATTED[
          chainId === L1_CHAIN_ID ? L1_CHAIN_ID : L2_CHAIN_ID
        ].rpcUrls.public.http[0]
      );
      // get the current multicall contract
      const multicall = await getMulticallContract(
        MULTICALL_CONTRACTS[chainId],
        provider
      );

      // only run the multicall if we're connected to the correct network
      if (client?.address && client?.address !== "0x" && multicall) {
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
            target: token.address as string,
            contract: new Contract(token.address, TOKEN_ABI, provider),
            fns: [
              {
                fn: "balanceOf",
                args: [client?.address as string],
              },
            ],
          };
        });
        // run all calls...
        const responses = await callMulticallContract(
          // connect to provider if different multicallContract default
          multicall,
          calls
        );
        const newBalances = responses.reduce((fillBalances, value, key) => {
          // copy of the obj
          const newFillBalances = { ...fillBalances };
          // set the balance value in to the token details
          newFillBalances[filteredTokens[key].address] = formatUnits(
            value?.toString() || "0",
            filteredTokens[key].decimals
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
                      (await provider?.getBalance(client.address!)) || "0",
                      18
                    )) ||
                  "0",
              }
            : {
                "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000":
                  (client.address &&
                    formatUnits(
                      (await provider?.getBalance(client.address!)) || "0",
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
