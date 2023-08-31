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
// import useAllowanceCheck from "@hooks/web3/converter/read/useAllowanceCheck";
// import useGasEstimate from "@hooks/web3/converter/read/useGasEstimate";

// TODO: remove unused state
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
  isLoadingFeeData: boolean;
  isLoadingBalances: boolean;
  isLoadingGasEstimate: boolean;

  errorMsg: string;
  ctaChainId: number;
  ctaStatus: string | boolean;
  isCTAPageOpen: boolean;
  isCTAPageOpenRef: MutableRefObject<boolean>;
  ctaErrorReset: MutableRefObject<(() => void | boolean) | undefined>;
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
  setErrorMsg: (errMsg: string) => void;
  setCTAChainId: (v: number) => void;
  setCTAStatus: (status: string | boolean) => void;
  setIsCTAPageOpen: (isCTAPageOpen: boolean) => void;
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

  // the error msg under CTA button
  const [errorMsg, setErrorMsg] = useState<string>("");
  // seperate the ctaChainId from the chainId to dissassociate the tabs from the cta
  const [ctaChainId, setCTAChainId] = useState(chainId);
  // status from the cta operation (this is currently being logged in the console)
  const [ctaStatus, setCTAStatus] = useState<string | boolean>(false);
  // setup modal controls - we will open and close the modal based on this state
  const [isCTAPageOpen, setIsCTAPageOpen] = useState(false);
  // wallet modal controls
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  // mobile menu controls
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  // a ref to the current page
  // const ctaPageRef = useRef<CTAPages>(CTAPages.Default);
  // a ref to the ctaPage open state
  const isCTAPageOpenRef = useRef(false);
  // allow resets to start waiting for the bridge tx after network failure by setting a "ctaErrorReset" override
  const ctaErrorReset = useRef<(() => void | boolean) | undefined>();

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

  // when we're loading the balance data we don't want to show error states
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  // loadingState for feeData
  const [isLoadingFeeData, setIsLoadingFeeData] = useState(true);

  // get current gas fees for L1
  const { l1FeeData, refetchL1FeeData } = useL1FeeData();

  // get current gas fees on selected network
  const feeData = useMemo(() => l1FeeData, [l1FeeData]);

  // perform a multicall on the given network to get token balances for user
  const { balances, resetBalances, isFetchingBalances, isRefetchingBalances } =
    useAccountBalances(chainId, client, tokens, setIsLoadingBalances);

  // fetch the allowance for the selected token on the selected chain
  // const { allowance, resetAllowance } = useAllowanceCheck(chainId, client);

  // fetch the gas estimate for the selected operation on in the selected direction
  // const { actualGasFee, isLoadingGasEstimate, resetGasEstimate } =
  //   useGasEstimate(chainId, client, amount || "0", balances, allowance);

  // keep updated
  useEffect(() => {
    isCTAPageOpenRef.current = isCTAPageOpen;
  }, [isCTAPageOpen]);

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

  // set the loading state for the TransactionPanel
  useEffect(() => {
    setIsLoadingFeeData(true);
  }, [chainId]);

  // reset the allowances and balances once we gather enough intel to make the calls
  useEffect(
    () => {
      resetBalances();
      refetchL1FeeData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, client?.address, multicall]
  );

  // log the new status to ctaStatus
  useEffect(() => {
    if (ctaStatus) {
      // eslint-disable-next-line no-console
      console.log(ctaStatus);
    }
  }, [ctaStatus]);

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
      // actualGasFee,
      isLoadingFeeData,
      isLoadingBalances:
        isLoadingBalances && isFetchingBalances && isRefetchingBalances,
      // isLoadingGasEstimate,

      errorMsg,
      ctaStatus,
      ctaChainId,
      isCTAPageOpen,
      isCTAPageOpenRef,
      walletModalOpen,
      mobileMenuOpen,

      amount,
      txHash,
      txHashRef,

      tokens,
      balances,
      // allowance,
      ctaErrorReset,

      setClient,
      setChainId,
      setSafeChains,
      resetBalances,
      // resetAllowance,
      // resetGasEstimate,

      setErrorMsg,
      setCTAChainId,
      setCTAStatus,
      setIsCTAPageOpen,
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
    // actualGasFee,
    isLoadingFeeData,
    isLoadingBalances,
    // isLoadingGasEstimate,
    isFetchingBalances,
    isRefetchingBalances,

    errorMsg,
    ctaStatus,
    ctaChainId,
    isCTAPageOpen,
    isCTAPageOpenRef,
    walletModalOpen,
    mobileMenuOpen,

    amount,
    txHash,
    txHashRef,

    tokens,
    balances,
    // allowance,
    ctaErrorReset,

    resetBalances,
    // resetAllowance,
    // resetGasEstimate,
  ]);

  return (
    <StateContext.Provider value={context}>{children}</StateContext.Provider>
  );
}

export default StateContext;
