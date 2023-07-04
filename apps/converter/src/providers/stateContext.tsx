"use client";

import {
  CTAPages,
  L1_BITDAO_TOKEN,
  L1_CHAIN_ID,
  L1_MANTLE_TOKEN,
  MULTICALL_CONTRACTS,
  Token,
  Views,
} from "@config/constants";

import { Contract } from "ethers";
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
import { useProvider } from "wagmi";
import { usePathname } from "next/navigation";
import { useAccountBalances, useL1FeeData, FeeData } from "@hooks/web3/read";

import { getMulticallContract } from "@utils/multicallContract";
import useAllowanceCheck from "@hooks/web3/converter/read/useAllowanceCheck";
import useGasEstimate from "@hooks/web3/converter/read/useGasEstimate";

export type StateProps = {
  view: Views;
  client: {
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
  };
  safeChains: number[];
  chainId: number;
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

  ctaPage: CTAPages;
  ctaPageRef: MutableRefObject<CTAPages>;
  errorMsg: string;
  ctaChainId: number;
  ctaStatus: string | boolean;
  isCTAPageOpen: boolean;
  isCTAPageOpenRef: MutableRefObject<boolean>;
  ctaErrorReset: MutableRefObject<(() => void | boolean) | undefined>;

  amount: string | undefined;
  txHash: string | boolean;
  txHashRef: MutableRefObject<string | undefined>;

  tokens: Token[];
  balances: Record<string, string>;
  allowance: string;

  setView: (v: Views) => void;
  setChainId: (v: number) => void;
  setClient: (client: {
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
  }) => void;
  setSafeChains: (chains: number[]) => void;
  resetBalances: () => void;
  resetAllowance: () => void;
  resetGasEstimate: () => void;
  setCTAPage: (ctaPage: CTAPages) => void;
  setErrorMsg: (errMsg: string) => void;
  setCTAChainId: (v: number) => void;
  setCTAStatus: (status: string | boolean) => void;
  setIsCTAPageOpen: (isCTAPageOpen: boolean) => void;
  setTxHash: (hash: string | boolean) => void;
  setAmount: (amount: string | boolean) => void;
};

// create a context to bind the provider to
const StateContext: Context<StateProps> = createContext<StateProps>(
  {} as StateProps
);

// create a provider to contain all state
export function StateProvider({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  // page toggled chainId (set according to Deposit/Withdraw)
  const [view, setView] = useState(
    pathName?.indexOf("/account") === -1 ? Views.Default : Views.Account
  );

  // page toggled chainId (set according to Deposit/Withdraw)
  const [chainId, setChainId] = useState(L1_CHAIN_ID);

  // initially set to just the current chainId (this will control when to show unsupported in the ConnectWallet component)
  const [safeChains, setSafeChains] = useState([L1_CHAIN_ID]);

  // get the provider for the chosen chain
  const provider = useProvider({ chainId });

  // keep hold of all wallet connection details
  const [client, setClient] = useState<{
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
  }>({
    isConnected: false,
  });

  // page toggled chainId (set according to Deposit/Withdraw)
  const multicall = useRef<{ network: Network; multicallContract: Contract }>();

  // the selected page within CTAPage to open
  const [ctaPage, setCTAPage] = useState<CTAPages>(CTAPages.Default);
  // the error msg under CTA button
  const [errorMsg, setErrorMsg] = useState<string>("");
  // seperate the ctaChainId from the chainId to dissassociate the tabs from the cta
  const [ctaChainId, setCTAChainId] = useState(chainId);
  // status from the cta operation (this is currently being logged in the console)
  const [ctaStatus, setCTAStatus] = useState<string | boolean>(false);
  // setup modal controls - we will open and close the modal based on this state
  const [isCTAPageOpen, setIsCTAPageOpen] = useState(false);

  // a ref to the current page
  const ctaPageRef = useRef<CTAPages>(CTAPages.Default);
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

  // perform a multicall on the given network to get all token balances for user
  const { balances, resetBalances, isFetchingBalances, isRefetchingBalances } =
    useAccountBalances(
      chainId,
      client,
      tokens,
      multicall,
      setIsLoadingBalances
    );

  // fetch the allowance for the selected token on the selected chain
  const { allowance, resetAllowance } = useAllowanceCheck(chainId, client);

  // fetch the gas estimate for the selected operation on in the selected direction
  const { actualGasFee, isLoadingGasEstimate, resetGasEstimate } =
    useGasEstimate(chainId, client, amount || "0", balances, allowance);

  // corrent view on page turn
  useEffect(
    () => {
      if (pathName?.indexOf("/account") === -1 && view === Views.Account) {
        setView(Views.Default);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathName]
  );

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

  // tied to the current page being viewed
  useEffect(() => {
    ctaPageRef.current = ctaPage;
  }, [ctaPage]);

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
      view,
      client,
      chainId,
      safeChains,
      multicall,

      feeData,
      l1FeeData,
      actualGasFee,
      isLoadingFeeData,
      isLoadingBalances:
        isLoadingBalances && isFetchingBalances && isRefetchingBalances,
      isLoadingGasEstimate,

      ctaPage,
      ctaPageRef,
      errorMsg,
      ctaStatus,
      ctaChainId,
      isCTAPageOpen,
      isCTAPageOpenRef,

      amount,
      txHash,
      txHashRef,

      tokens,
      balances,
      allowance,
      ctaErrorReset,

      setView,
      setClient,
      setChainId,
      setSafeChains,
      resetBalances,
      resetAllowance,
      resetGasEstimate,

      setCTAPage,
      setErrorMsg,
      setCTAChainId,
      setCTAStatus,
      setIsCTAPageOpen,

      setAmount,
      setTxHash,
    } as StateProps;
  }, [
    view,
    client,
    chainId,
    safeChains,
    multicall,

    feeData,
    l1FeeData,
    actualGasFee,
    isLoadingFeeData,
    isLoadingBalances,
    isLoadingGasEstimate,
    isFetchingBalances,
    isRefetchingBalances,

    ctaPage,
    ctaPageRef,
    errorMsg,
    ctaStatus,
    ctaChainId,
    isCTAPageOpen,
    isCTAPageOpenRef,

    amount,
    txHash,
    txHashRef,

    tokens,
    balances,
    allowance,
    ctaErrorReset,

    resetBalances,
    resetAllowance,
    resetGasEstimate,
  ]);

  return (
    <StateContext.Provider value={context}>{children}</StateContext.Provider>
  );
}

export default StateContext;
