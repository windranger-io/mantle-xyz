"use client";

import {
  L1_BITDAO_TOKEN,
  L1_CHAIN_ID,
  L1_MANTLE_TOKEN,
  MULTICALL_CONTRACTS,
  Token,
} from "@config/constants";

import { Contract, providers } from "ethers";
import { Network } from "@ethersproject/providers";

import {
  Context,
  createContext,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePublicClient } from "wagmi";
import { useAccountBalances, useL1FeeData, FeeData } from "@hooks/web3/read";

import { getMulticallContract } from "@utils/multicallContract";

// TODO: refactor this file
export type StateProps = {
  client: {
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
    connector?: string;
  }; // yes
  safeChains: number[]; // yes
  chainId: number; // yes
  provider: providers.JsonRpcProvider | providers.FallbackProvider;
  multicall: MutableRefObject<{
    network: Network;
    multicallContract: Contract;
  }>;

  feeData: FeeData;
  l1FeeData: FeeData;
  l2FeeData: FeeData;
  actualGasFee: string;

  walletModalOpen: boolean; // yes
  mobileMenuOpen: boolean; // yes

  amount: string | undefined;
  txHash: string | boolean;
  txHashRef: MutableRefObject<string | undefined>;

  tokens: Token[];
  balances: Record<string, string>;
  allowance: string;

  setChainId: (v: number) => void;
  setClient: (client: {
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
    connector?: string;
  }) => void; // yes
  setSafeChains: (chains: number[]) => void;
  resetBalances: () => void;
  resetAllowance: () => void;
  resetGasEstimate: () => void;
  setTxHash: (hash: string | boolean) => void;
  setAmount: (amount: string | boolean) => void;
  setWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>; // yes
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>; // yes
};

// create a context to bind the provider to
const StateContext: Context<StateProps> = createContext<StateProps>(
  {} as StateProps
);

// create a provider to contain all state
export function StateProvider({ children }: { children: React.ReactNode }) {
  // page toggled chainId (set according to Deposit/Withdraw)
  const [chainId, setChainId] = useState(L1_CHAIN_ID);

  // initially set to just the current chainId (this will control when to show unsupported in the ConnectWallet component)
  const [safeChains, setSafeChains] = useState([L1_CHAIN_ID]);

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

  // page toggled chainId (set according to Deposit/Withdraw)
  const multicall = useRef<{ network: Network; multicallContract: Contract }>();

  // wallet modal controls
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  // mobile menu controls
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // amount to be converted
  const [amount, setAmount] = useState<string>("");
  // txHashes associated with the current action
  const [txHash, setTxHash] = useState<string | boolean>(false);
  // keep the tx Hash as a ref so we can tell which tx is currently in focus
  const txHashRef = useRef<string>();

  // the current chains token list
  const tokens = useMemo(() => {
    return [L1_BITDAO_TOKEN, L1_MANTLE_TOKEN];
  }, []);

  // get current gas fees for L1
  const { l1FeeData, refetchL1FeeData } = useL1FeeData();

  // get current gas fees on selected network
  const feeData = useMemo(() => l1FeeData, [l1FeeData]);

  // perform a multicall on the given network to get token balances for user
  const { balances, resetBalances, isFetchingBalances, isRefetchingBalances } =
    useAccountBalances(chainId, client, tokens, setIsLoadingBalances);

  // make sure the multicall contract in the current context is assigned to the current network
  useEffect(() => {
    getMulticallContract(MULTICALL_CONTRACTS[chainId], provider).then(
      async (multicallContract) => {
        // check that we're using the corrent network before proceeding
        const network = await multicallContract.provider.getNetwork();
        // setMulticall(multicallContract);
        multicall.current = {
          network,
          multicallContract,
        };
      }
    );
  }, [chainId, provider, client]);

  // reset the allowances and balances once we gather enough intel to make the calls
  useEffect(
    () => {
      resetBalances();
      refetchL1FeeData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, client?.address, multicall]
  );

  // combine everything into a context provider
  const context = useMemo(() => {
    return {
      client,
      chainId,
      safeChains,
      provider,
      multicall,

      feeData,
      l1FeeData,
      walletModalOpen,
      mobileMenuOpen,

      amount,
      txHash,
      txHashRef,

      tokens,
      balances,

      setClient,
      setChainId,
      setSafeChains,
      resetBalances,
      setWalletModalOpen,
      setMobileMenuOpen,

      setAmount,
      setTxHash,
    } as StateProps;
  }, [
    client,
    chainId,
    safeChains,
    provider,
    multicall,

    feeData,
    l1FeeData,
    isFetchingBalances,
    isRefetchingBalances,

    walletModalOpen,
    mobileMenuOpen,

    amount,
    txHash,
    txHashRef,

    tokens,
    balances,

    resetBalances,
  ]);

  return (
    <StateContext.Provider value={context}>{children}</StateContext.Provider>
  );
}

export default StateContext;
