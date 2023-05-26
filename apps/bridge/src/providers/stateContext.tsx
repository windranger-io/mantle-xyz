"use client";

import {
  BRIDGE_BACKEND,
  CTAPages,
  Direction,
  HISTORY_ITEMS_PER_PAGE,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MANTLE_TOKEN_LIST,
  MULTICALL_CONTRACTS,
  Token,
  Views,
} from "@config/constants";

import { Contract } from "ethers";
import { MessageLike } from "@mantleio/sdk";
import { Network } from "@ethersproject/providers";

import {
  createContext,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useProvider } from "wagmi";
import { usePathname } from "next/navigation";
import {
  useAccountBalances,
  useL1FeeData,
  useL2FeeData,
  FeeData,
} from "@hooks/web3/read";

import {
  useAllowanceCheck,
  useTokenPairBridge,
  useGasEstimate,
  useHistoryDeposits,
  useHistoryWithdrawals,
  Deposit,
  Withdrawal,
} from "@hooks/web3/bridge/read";

import { getAddress } from "ethers/lib/utils.js";
import { getMulticallContract } from "@utils/multicallContract";

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
  bridgeAddress: string;

  feeData: FeeData;
  l1FeeData: FeeData;
  l2FeeData: FeeData;
  actualGasFee: string;
  isLoadingFeeData: boolean;
  isLoadingBalances: boolean;

  tx1: MessageLike;
  ctaPage: CTAPages;
  ctaPageRef: MutableRefObject<CTAPages>;
  ctaChainId: number;
  tx1Hash: string | boolean;
  tx2Hash: string | boolean;
  ctaStatus: string | boolean;
  isCTAPageOpen: boolean;
  isCTAPageOpenRef: MutableRefObject<boolean>;
  tx1HashRef: MutableRefObject<string | undefined>;
  tx2HashRef: MutableRefObject<string | undefined>;
  ctaErrorReset: MutableRefObject<(() => void | boolean) | undefined>;

  tokens: Token[];
  balances: Record<string, string>;
  allowance: string;
  selectedToken: {
    [key in Direction]: string;
  };
  destinationToken: {
    [key in Direction]: string;
  };
  selectedTokenAmount: string;
  destinationTokenAmount: string;

  deposits: Deposit[];
  withdrawals: Withdrawal[];
  withdrawalStatuses: MutableRefObject<Record<string, string>>;
  withdrawalTx2Hashes: MutableRefObject<Record<string, string>>;
  hasClaims: boolean;
  hasPendings: boolean;
  depositsPage: number;
  withdrawalsPage: number;
  hasClosedClaims: boolean;
  isLoadingDeposits: boolean;
  isLoadingWithdrawals: boolean;

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
  refetchWithdrawals: () => void;
  refetchDeposits: () => void;
  loadMoreWithdrawals: () => void;
  loadMoreDeposits: () => void;
  setTx1: (tx: MessageLike) => void;
  setCTAPage: (ctaPage: CTAPages) => void;
  setCTAChainId: (v: number) => void;
  setTx1Hash: (hash: string | boolean) => void;
  setTx2Hash: (hash: string | boolean) => void;
  setCTAStatus: (status: string | boolean) => void;
  setIsCTAPageOpen: (isCTAPageOpen: boolean) => void;
  setSelectedToken: (type: Direction, value: string) => void;
  setDestinationToken: (type: Direction, value: string) => void;
  setSelectedTokenAmount: (amount?: string) => void;
  setDestinationTokenAmount: (amount: string) => void;
  setHasClosedClaims: (closed: boolean) => void;
};

// create a context to bind the provider to
const StateContext = createContext<StateProps>({} as StateProps);

// create a provider to contain all state
export function StateProvider({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  // page toggled chainId (set according to Deposit/Withdraw)
  const [view, setView] = useState(
    pathName?.indexOf("/account") === -1 ? Views.Default : Views.Account
  );

  // page toggled chainId (set according to Deposit/Withdraw)
  const [chainId, setChainId] = useState(5);

  // initially set to just the current chainId (this will control when to show unsupported in the ConnectWallet component)
  const [safeChains, setSafeChains] = useState([5]);

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
  // seperate the ctaChainId from the chainId to dissassociate the tabs from the cta
  const [ctaChainId, setCTAChainId] = useState(chainId);
  // status from the cta operation (this is currently being logged in the console)
  const [ctaStatus, setCTAStatus] = useState<string | boolean>(false);
  // setup modal controls - we will open and close the modal based on this state
  const [isCTAPageOpen, setIsCTAPageOpen] = useState(false);
  // txHashes associated with the current action
  const [tx1Hash, setTx1Hash] = useState<string | boolean>(false);
  const [tx2Hash, setTx2Hash] = useState<string | boolean>(false);
  // tx1 assoicated with the current action - we use this to carry the tx between pages (Withdraw -> Withdrawn)
  const [tx1, setTx1] = useState<MessageLike>();

  // a ref to the current page
  const ctaPageRef = useRef<CTAPages>(CTAPages.Default);
  // a ref to the ctaPage open state
  const isCTAPageOpenRef = useRef(false);
  // allow resets to start waiting for the bridge tx after network failure by setting a "ctaErrorReset" override
  const ctaErrorReset = useRef<(() => void | boolean) | undefined>();
  // record if the hasClaims notif is closed so that we dont re-open it again every page turn
  const [hasClosedClaims, setHasClosedClaims] = useState(false);
  // keep the tx Hashes as a ref so we can tell which tx is currently in focus (tx2 will be set when complete)
  const tx1HashRef = useRef<string>();
  const tx2HashRef = useRef<string>();

  // all token selections from both panes
  const [selectedToken, setSelectedToken] = useState<{
    [key in Direction]: string;
  }>({ [Direction.Deposit]: "BitDAO", [Direction.Withdraw]: "BitDAO" });
  const [destinationToken, setDestinationToken] = useState<{
    [key in Direction]: string;
  }>({ [Direction.Deposit]: "BitDAO", [Direction.Withdraw]: "BitDAO" });

  // amounts (input and destination supplied to final tx's)
  const [selectedTokenAmount, setSelectedTokenAmount] = useState<string>("");
  const [destinationTokenAmount, setDestinationTokenAmount] =
    useState<string>("");

  // the current chains token list
  const tokens = useMemo(() => {
    return MANTLE_TOKEN_LIST.tokens.filter((v) => {
      return v.chainId === chainId;
    });
  }, [chainId]);

  // request the appropriate bridge information from mantlesdk
  const { bridgeAddress } = useTokenPairBridge(
    chainId,
    selectedToken,
    destinationToken,
    tokens
  );

  // when we're loading the balance data we don't want to show error states
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  // loadingState for feeData
  const [isLoadingFeeData, setIsLoadingFeeData] = useState(true);

  // control the page to load more items from the history pages
  // - we're not using this style of pagination
  // - its cheaper to just request everything in 1 req because the sort order of the pagination is reversed
  const withdrawalsPage = useRef(0);
  const depositsPage = useRef(0);

  // combine all results into arrays
  const [withdrawals, setWithdrawals] = useState<Withdrawal[] | undefined>([]);
  const [deposits, setDeposits] = useState<Deposit[] | undefined>([]);

  // use a ref to fill the withdrawalStatuses
  const withdrawalStatuses = useRef({});
  const withdrawalTx2Hashes = useRef({});

  // transaction history page urls
  const withdrawalsUrl = useMemo(() => {
    // reset the withdrawals
    setWithdrawals(undefined);
    return (
      (client.address &&
        `${BRIDGE_BACKEND}/v1/withdrawals/${getAddress(
          client.address
        )}?offset=${
          withdrawalsPage.current * HISTORY_ITEMS_PER_PAGE
        }&limit=${HISTORY_ITEMS_PER_PAGE}`) ||
      ""
    );
  }, [client.address, withdrawalsPage]);
  const depositsUrl = useMemo(() => {
    // reset the deposits on user change
    setDeposits(undefined);
    return (
      (client.address &&
        `${BRIDGE_BACKEND}/v1/deposits/${getAddress(client.address)}?offset=${
          depositsPage.current * HISTORY_ITEMS_PER_PAGE
        }&limit=${HISTORY_ITEMS_PER_PAGE}`) ||
      ""
    );
  }, [client.address, depositsPage]);

  // query to fetch withdrawals history in batches of HISTORY_ITEMS_PER_PAGE
  const { refetchWithdrawalsPage, isLoadingWithdrawals } =
    useHistoryWithdrawals(client, withdrawalsUrl, withdrawals, setWithdrawals);

  // query to fetch deposit history in batches of HISTORY_ITEMS_PER_PAGE
  const { refetchDepositsPage, isLoadingDeposits } = useHistoryDeposits(
    client,
    depositsUrl,
    deposits,
    setDeposits
  );

  // does the user have claims available?
  const hasClaims = useMemo(() => {
    const checkForClaims =
      (withdrawals || []).filter((tx) => tx.status === "Ready for Relay")
        .length > 0;
    return checkForClaims;
  }, [withdrawals]);

  // is the user waiting for a relay to complete?
  const hasPendings = useMemo(() => {
    const checkForWaiting =
      (withdrawals || []).filter((tx) => tx.status === "Waiting").length > 0;
    return checkForWaiting;
  }, [withdrawals]);

  // get current gas fees for L1
  const { l1FeeData, refetchL1FeeData } = useL1FeeData();

  // get current gas fees for l2
  const { l2FeeData, refetchL2FeeData } = useL2FeeData();

  // get current gas fees on selected network
  const feeData = useMemo(
    () =>
      // return the selected chains feeData as default
      chainId === L1_CHAIN_ID ? l1FeeData : l2FeeData,
    [chainId, l1FeeData, l2FeeData]
  );

  // fetch the allowance for the selected token on the selected chain
  const { allowance, resetAllowance } = useAllowanceCheck(
    chainId,
    client,
    bridgeAddress,
    selectedToken,
    tokens
  );

  // fetch the gas estimate for the selected operation on in the selected direction
  const { actualGasFee, resetGasEstimate } = useGasEstimate(
    chainId,
    client,
    selectedToken,
    destinationToken,
    bridgeAddress,
    destinationTokenAmount
  );

  // perform a multicall on the given network to get all token balances for user
  const { balances, resetBalances, isFetchingBalances, isRefetchingBalances } =
    useAccountBalances(
      chainId,
      client,
      tokens,
      multicall,
      setIsLoadingBalances
    );

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

  // reset the loading state for the TransactionPanel
  useEffect(() => {
    if (actualGasFee && actualGasFee !== "0") {
      setIsLoadingFeeData(false);
    }
  }, [actualGasFee]);

  // keep the tx1Hash ref up to data
  useEffect(() => {
    tx1HashRef.current = (tx1Hash || "").toString();
  }, [tx1Hash]);

  // keep the tx2Hash ref up to data
  useEffect(() => {
    tx2HashRef.current = (tx2Hash || "").toString();
  }, [tx2Hash]);

  // tied to the current page being viewed
  useEffect(() => {
    ctaPageRef.current = ctaPage;
  }, [ctaPage]);

  // reset the allowances and balances once we gather enough intel to make the calls
  useEffect(
    () => {
      resetAllowance();
      resetBalances();
      refetchL1FeeData();
      refetchL2FeeData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, client?.address, selectedToken, multicall, bridgeAddress]
  );

  // reset the gas estimate every time we make a change
  useEffect(() => {
    resetGasEstimate();
  }, [
    chainId,
    client?.address,
    selectedToken,
    destinationToken,
    bridgeAddress,
    destinationTokenAmount,
    resetGasEstimate,
  ]);

  // log the new status to ctaStatus
  useEffect(() => {
    if (ctaStatus) {
      // eslint-disable-next-line no-console
      console.log(ctaStatus);
    }
  }, [ctaStatus]);

  // combine everything into a context provider
  const context = useMemo(() => {
    // when selecting a token by type we also want to set the destination (the corresponding l2 token) and correct the TokenAmounts to prevent overflows
    const setSelectTokenByType = (
      type: keyof StateProps["selectedToken"],
      value: string
    ) => {
      // the opposite of the chain we're working with
      const targetChainID = chainId === L1_CHAIN_ID ? L2_CHAIN_ID : L1_CHAIN_ID;

      // old selection used to build the current selectedTokenAmount
      const oSelection =
        tokens.find((v) => {
          return selectedToken[type] === v.name && v.chainId === chainId;
        }) || tokens[chainId === L1_CHAIN_ID ? 0 : 1];

      // new selection as per the currently selected chain
      const selection =
        tokens.find((v) => {
          return value === v.name && v.chainId === chainId;
        }) || tokens[chainId === L1_CHAIN_ID ? 0 : 1];

      // new destination as per the opposite chain
      const destination =
        MANTLE_TOKEN_LIST.tokens.find((v) => {
          return selection.logoURI === v.logoURI && v.chainId === targetChainID;
        }) || tokens[chainId === L1_CHAIN_ID ? 1 : 0];

      // prevent overflow
      if (
        oSelection.decimals > selection.decimals &&
        selectedTokenAmount.split(".")[1].length > selection.decimals
      ) {
        // only working against expo
        const [int, expo] = selectedTokenAmount.split(".");

        // chomp the extra digits
        const frac = `${expo.substring(0, destination.decimals) || 0}`;
        const num = `${int}.${frac}`;

        // insteand of chomping we could use this version to apply rounding....

        // // shouldnt ever be more than 18dps so is safe to use with js numbers
        // const frac = parseFloat(`0.${expo}`).toFixed(destination.decimals);
        // // reconstruct the num with rounded fracs
        // const num =
        //   String(frac)[0] === "1"
        //     ? `${BigNumber.from(int).add(1).toString()}.${String(
        //         frac
        //       ).substring(2)}`
        //     : `${int}.${String(frac).substring(2)}`;

        // set the new value as the TokenAmount (selected & destination)
        setSelectedTokenAmount(num);
        setDestinationTokenAmount(num);
      }

      // apply the new selection (always group sets at the end of a useEffect/Memo to reduce unnecessary redraws)
      setSelectedToken({
        ...selectedToken,
        // place new selection
        [type]: value,
      });
      setDestinationToken({
        ...destinationToken,
        // place new destination
        [type]: destination.name,
      });
    };

    // setting the destination token only sets the destination token
    const setDestinationTokenByType = (
      type: keyof StateProps["destinationToken"],
      value: string
    ) => {
      setDestinationToken({
        ...destinationToken,
        // place new destination
        [type]: value,
      });
    };

    const loadMoreWithdrawals = () => {
      withdrawalsPage.current += 1;
    };

    const loadMoreDeposits = () => {
      depositsPage.current += 1;
    };

    const refetchWithdrawals = () => {
      withdrawalsPage.current = 0;
      refetchWithdrawalsPage();
    };

    const refetchDeposits = () => {
      depositsPage.current = 0;
      refetchDepositsPage();
    };

    return {
      view,
      client,
      chainId,
      safeChains,
      multicall,
      bridgeAddress,

      feeData,
      l1FeeData,
      l2FeeData,
      actualGasFee,
      isLoadingFeeData,
      isLoadingBalances:
        isLoadingBalances && isFetchingBalances && isRefetchingBalances,

      tx1,
      ctaPage,
      ctaPageRef,
      tx1Hash,
      tx2Hash,
      tx1HashRef,
      tx2HashRef,
      ctaStatus,
      ctaChainId,
      isCTAPageOpen,
      isCTAPageOpenRef,

      hasClaims,
      hasPendings,
      withdrawals,
      deposits,
      depositsPage: depositsPage.current,
      withdrawalsPage: withdrawalsPage.current,
      withdrawalStatuses,
      withdrawalTx2Hashes,
      isLoadingDeposits,
      isLoadingWithdrawals,
      hasClosedClaims,

      tokens,
      balances,
      allowance,
      selectedToken,
      destinationToken,
      selectedTokenAmount,
      destinationTokenAmount,

      ctaErrorReset,

      setView,
      setClient,
      setChainId,
      setSafeChains,
      resetBalances,
      resetAllowance,

      refetchDeposits,
      refetchWithdrawals,
      loadMoreDeposits,
      loadMoreWithdrawals,

      setTx1,
      setCTAPage,
      setCTAChainId,
      setTx1Hash,
      setTx2Hash,
      setCTAStatus,
      setIsCTAPageOpen,
      setHasClosedClaims,

      setSelectedTokenAmount,
      setDestinationTokenAmount,
      setSelectedToken: setSelectTokenByType,
      setDestinationToken: setDestinationTokenByType,
    } as StateProps;
  }, [
    view,
    client,
    chainId,
    safeChains,
    multicall,
    bridgeAddress,

    feeData,
    l1FeeData,
    l2FeeData,
    actualGasFee,
    isLoadingFeeData,
    isLoadingBalances,
    isFetchingBalances,
    isRefetchingBalances,

    tx1,
    ctaPage,
    ctaPageRef,
    tx1Hash,
    tx2Hash,
    tx1HashRef,
    tx2HashRef,
    ctaStatus,
    ctaChainId,
    isCTAPageOpen,
    isCTAPageOpenRef,

    hasClaims,
    hasPendings,
    withdrawals,
    deposits,
    depositsPage,
    withdrawalsPage,
    isLoadingDeposits,
    isLoadingWithdrawals,
    hasClosedClaims,

    tokens,
    balances,
    allowance,
    selectedToken,
    destinationToken,
    selectedTokenAmount,
    destinationTokenAmount,

    ctaErrorReset,

    resetBalances,
    resetAllowance,
    refetchDepositsPage,
    refetchWithdrawalsPage,
  ]);

  return (
    <StateContext.Provider value={context}>{children}</StateContext.Provider>
  );
}

export default StateContext;
