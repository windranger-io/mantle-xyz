"use client";

import { L1_CHAIN_ID } from "@config/constants";

import { providers } from "ethers";

import { Context, createContext, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";

export type StateProps = {
  client: {
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
    connector?: string;
  };
  chainId: number;
  provider: providers.JsonRpcProvider | providers.FallbackProvider;
  setClient: (client: {
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
    connector?: string;
  }) => void;
};

// create a context to bind the provider to
const StateContext: Context<StateProps> = createContext<StateProps>(
  {} as StateProps
);

// create a provider to contain all state
export function StateProvider({ children }: { children: React.ReactNode }) {
  // page toggled chainId (set according to Deposit/Withdraw)
  const [chainId] = useState(L1_CHAIN_ID);

  // get the provider for the chosen chain
  const publicClient = usePublicClient({ chainId });

  // create an ethers provider from the publicClient
  const provider = useMemo(() => {
    const { chain, transport } = publicClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback")
      return new providers.FallbackProvider(
        (transport.transports as { value: { url: string } }[]).map(
          ({ value }) => new providers.JsonRpcProvider(value?.url, network)
        )
      );
    return new providers.JsonRpcProvider(transport.url, network);
  }, [publicClient]);

  // keep hold of all wallet connection details
  const [client, setClient] = useState<{
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
    connector?: string;
  }>({
    isConnected: false,
  });

  // combine everything into a context provider
  const context = useMemo(() => {
    return {
      client,
      chainId,
      provider,
      setClient,
    } as StateProps;
  }, [client, chainId, provider]);

  return (
    <StateContext.Provider value={context}>{children}</StateContext.Provider>
  );
}

export default StateContext;
