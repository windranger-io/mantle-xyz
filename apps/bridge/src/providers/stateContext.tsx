"use client";

import {
  createContext,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { goerli, useFeeData, useProvider, useQuery } from "wagmi";
import { debounce } from "lodash";

import {
  BRIDGE_BACKEND,
  CTAPages,
  Direction,
  HISTORY_ITEMS_PER_PAGE,
  MANTLE_TESTNET_CHAIN,
  MANTLE_TOKEN_LIST,
  MULTICALL_CONTRACTS,
  Token,
  TOKEN_ABI,
  Views,
} from "@config/constants";
import {
  callMulticallContract,
  getMulticallContract,
} from "@utils/multicallContract";

import { BigNumber, BigNumberish, constants, Contract } from "ethers";
import { formatUnits, getAddress, parseUnits } from "ethers/lib/utils.js";

import { usePathname } from "next/navigation";
import { MessageLike } from "@mantleio/sdk";
import { useMantleSDK } from "./mantleSDKContext";

export type Deposit = {
  l1Token: {
    address: string;
  };
  l2Token: string;
  amount: string;
  transactionHash: string;
  blockTimestamp: number;
  blockNumber: number;
};

export type Withdrawal = {
  status: string;
  l1Token: {
    address: string;
  };
  l2Token: string;
  amount: string;
  transactionHash: string;
  ready_for_relay: boolean;
  is_finalized: boolean;
  blockTimestamp: number;
  blockNumber: number;
};

export type FeeData = {
  data: {
    gasPrice: BigNumber;
  };
};

// @TODO: This needs breaking up into seperate hooks and some of the names could do with being altered
// (L1/L2 is switched depending on which chain your on, Tx1 and Tx2 would make more sense)

export type StateProps = {
  view: Views;
  client: {
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
  };
  safeChains: number[];
  chainId: number;
  multicall: Contract;
  bridgeAddress: string;

  feeData: FeeData;
  l1FeeData: FeeData;
  l2FeeData: FeeData;
  actualGasFee: string;
  isLoadingFeeData: boolean;
  isLoadingBalances: boolean;

  l1Tx: MessageLike;
  ctaPage: CTAPages;
  ctaPageRef: MutableRefObject<CTAPages>;
  ctaChainId: number;
  l1TxHash: string | boolean;
  l2TxHash: string | boolean;
  ctaStatus: string | boolean;
  isCTAPageOpen: boolean;
  isCTAPageOpenRef: MutableRefObject<boolean>;
  l1TxHashRef: MutableRefObject<string | undefined>;
  l2TxHashRef: MutableRefObject<string | undefined>;
  ctaErrorReset: MutableRefObject<(() => void | boolean) | undefined>;

  tokens: Token[];
  balances: Record<string, string>;
  allowance: string;
  selectedToken: {
    [Direction.Deposit]: string;
    [Direction.Withdraw]: string;
  };
  destinationToken: {
    [Direction.Deposit]: string;
    [Direction.Withdraw]: string;
  };
  selectedTokenAmount: string;
  destinationTokenAmount: string;

  deposits: Deposit[];
  withdrawals: Withdrawal[];
  withdrawalStatuses: MutableRefObject<Record<string, string>>;
  hasClaims: boolean;
  hasPendings: boolean;
  depositsPage: number;
  withdrawalsPage: number;
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
  setL1Tx: (tx: MessageLike) => void;
  setCTAPage: (ctaPage: CTAPages) => void;
  setCTAChainId: (v: number) => void;
  setL1TxHash: (hash: string | boolean) => void;
  setL2TxHash: (hash: string | boolean) => void;
  setCTAStatus: (status: string | boolean) => void;
  setIsCTAPageOpen: (isCTAPageOpen: boolean) => void;
  setSelectedToken: (type: Direction, value: string) => void;
  setDestinationToken: (type: Direction, value: string) => void;
  setSelectedTokenAmount: (amount?: string) => void;
  setDestinationTokenAmount: (amount: string) => void;
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

  // we'll use the crossChainMessenger here to estimate gas costs
  const { crossChainMessenger, getMessageStatus } = useMantleSDK();

  // keep hold of all wallet connection details
  const [client, setClient] = useState<{
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
  }>({
    isConnected: false,
  });

  // page toggled chainId (set according to Deposit/Withdraw)
  const [multicall, setMulticall] = useState<Contract>();

  // store each tokens balance
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [allowance, setAllowance] = useState<string>("");

  // state trigger to recall allowance check
  const [manuallyResetAllowance, setManuallyResetAllowance] = useState<object>(
    {}
  );

  // state trigger to recall balance checks
  const [manuallyResetBalances, setManuallyResetBalances] = useState<object>(
    {}
  );

  // method to call to reset the allowance
  const resetAllowance = () => {
    setManuallyResetAllowance({});
  };

  // method to call to reset the balances
  const resetBalances = () => {
    setManuallyResetBalances({});
  };

  // the selected page within CTAPage to open
  const [ctaPage, setCTAPage] = useState<CTAPages>(CTAPages.Default);
  // a ref to the current page
  const ctaPageRef = useRef<CTAPages>(CTAPages.Default);
  // seperate the ctaChainId from the chainId to dissassociate the tabs from the cta
  const [ctaChainId, setCTAChainId] = useState(chainId);
  // setup modal controls - we will open and close the modal based on this state
  const [isCTAPageOpen, setIsCTAPageOpen] = useState(false);
  // store as a ref
  const isCTAPageOpenRef = useRef(false);
  // status from the cta operation
  const [ctaStatus, setCTAStatus] = useState<string | boolean>(false);
  // allow resets to start waiting for the bridge tx after network failure
  const ctaErrorReset = useRef<(() => void | boolean) | undefined>();

  // txHashes associated with the current action
  const [l1TxHash, setL1TxHash] = useState<string | boolean>(false);
  const [l2TxHash, setL2TxHash] = useState<string | boolean>(false);
  // keep the l1TxHash as a ref so we can tell which tx is currently in focus
  const l1TxHashRef = useRef<string>();
  const l2TxHashRef = useRef<string>();

  // l1Tx assoicated with the current action - we use this to carry the tx between pages (Withdraw -> Withdrawn)
  const [l1Tx, setL1Tx] = useState<MessageLike>();

  // allow the allowance checks to be debounced
  const commitAllowanceRef = useRef<() => void>();

  // allow the gasEstimate checks to be debounced
  const gasEstimateRef = useRef<() => void>();

  // all token selections from both panes
  const [selectedToken, setSelectedToken] = useState<{
    [Direction.Deposit]: string;
    [Direction.Withdraw]: string;
  }>({ [Direction.Deposit]: "BitDAO", [Direction.Withdraw]: "BitDAO" });
  const [destinationToken, setDestinationToken] = useState<{
    [Direction.Deposit]: string;
    [Direction.Withdraw]: string;
  }>({ [Direction.Deposit]: "BitDAO", [Direction.Withdraw]: "BitDAO" });

  // amounts (input and destination supplied to final tx's)
  const [selectedTokenAmount, setSelectedTokenAmount] = useState<string>("");
  const [destinationTokenAmount, setDestinationTokenAmount] =
    useState<string>("");

  // record the actual gas fee as it becomes available
  const [actualGasFee, setActualGasFee] = useState<string>("");

  // when we're loading the balance data we don't want to show error states
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // loadingState for feeData
  const [isLoadingFeeData, setIsLoadingFeeData] = useState(true);

  // control the page to load more items from the history pages
  const withdrawalsPage = useRef(0);
  const depositsPage = useRef(0);

  // combine all results into arrays
  const [withdrawals, setWithdrawals] = useState<Withdrawal[] | undefined>([]);
  const [deposits, setDeposits] = useState<Deposit[] | undefined>([]);

  // use a ref to fill the withdrawalStatuses
  const withdrawalStatuses = useRef({});

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

  // the current chains token list
  const tokens = useMemo(() => {
    return MANTLE_TOKEN_LIST.tokens.filter((v) => {
      return v.chainId === chainId;
    });
  }, [chainId]);

  // request the appropriate bridge information from mantlesdk
  const { data: bridgeAddress } = useQuery(
    [
      "GET_BRIDGE_FOR_TOKEN_PAIR",
      {
        chainId,
        destinationToken,
        isConnected:
          !!crossChainMessenger && !!multicall?.provider && !!client.address,
      },
    ],
    async ({ queryKey }) => {
      const type = chainId === 5 ? Direction.Deposit : Direction.Withdraw;
      const layer = chainId === 5 ? "l1Bridge" : "l2Bridge";
      const keys = queryKey[1] as {
        destinationToken: {
          [Direction.Deposit]: string;
          [Direction.Withdraw]: string;
        };
      };
      if (keys.destinationToken && crossChainMessenger) {
        const targetChainID = chainId === 5 ? 5001 : 5;

        // get the selection Token
        const selection =
          tokens.find((v) => {
            return selectedToken[type] === v.name && v.chainId === chainId;
          }) || tokens[chainId === 5 ? 0 : 1];

        // get the destination Token
        const destination =
          MANTLE_TOKEN_LIST.tokens.find((v) => {
            return (
              selection.logoURI === v.logoURI && v.chainId === targetChainID
            );
          }) || tokens[chainId === 5 ? 1 : 0];

        // rearrange the selection/destination
        const l1Address =
          chainId === 5 ? selection.address : destination.address;
        const l2Address =
          chainId === 5 ? destination.address : selection.address;

        // get the bridge for the given pair
        const bridge = await crossChainMessenger?.getBridgeForTokenPair(
          l1Address,
          l2Address
        );

        // returns the bridge address
        return bridge?.[layer].address;
      }

      return false;
    },
    {
      // cache for 30s
      cacheTime: 30,
    }
  );

  // query to fetch withdrawals history in batches of HISTORY_ITEMS_PER_PAGE
  const { refetch: refetchWithdrawalsPage, isLoading: isLoadingWithdrawals } =
    useQuery(
      ["HISTORICAL_WITHDRAWALS", { withdrawalsUrl }],
      async () => {
        const res = await fetch(withdrawalsUrl);
        const data = await res.json();
        const items: Withdrawal[] = [...(withdrawals || [])];
        const uniques: Record<string, Withdrawal> = (withdrawals || []).reduce(
          (txs: Record<string, Withdrawal>, tx: Withdrawal) => {
            return {
              ...txs,
              [tx.transactionHash]: tx,
            };
          },
          {} as Record<string, Withdrawal>
        );

        // update old entries and place new ones
        data.items?.forEach((tx: Withdrawal) => {
          if (!uniques[tx.transactionHash]) {
            items.push({
              ...tx,
              status: tx.status || "",
            });
          } else {
            const index = items.findIndex(
              (i) => i.transactionHash === tx.transactionHash
            );
            if (index !== -1) {
              // update the item in place
              items[index] = {
                ...tx,
                status: tx.status || "",
              };
            } else {
              items.push({
                ...tx,
                status: tx.status || "",
              });
            }
          }
        });

        // set the new items
        setWithdrawals(
          [...items].sort((a, b) => b.blockNumber - a.blockNumber)
        );

        // we're not using this response directly atm
        return data.items;
      },
      {
        enabled: !!client.address && !!withdrawalsUrl && !!getMessageStatus,
        cacheTime: 30,
      }
    );

  // query to fetch deposit history in batches of HISTORY_ITEMS_PER_PAGE
  const { refetch: refetchDepositsPage, isLoading: isLoadingDeposits } =
    useQuery(
      ["HISTORICAL_DEPOSITS", { depositsUrl }],
      async () => {
        const res = await fetch(depositsUrl);
        const data = await res.json();
        const items: Deposit[] = [...(deposits || [])];
        const uniques: Record<string, Deposit> = (deposits || []).reduce(
          (txs: Record<string, Deposit>, tx: Deposit) => {
            return {
              ...txs,
              [tx.transactionHash]: tx,
            };
          },
          {} as Record<string, Deposit>
        );

        // update old entries and place new ones
        data.items?.forEach((tx: Deposit) => {
          if (!uniques[tx.transactionHash]) {
            items.push(tx);
          } else {
            const index = items.findIndex(
              (i) => i.transactionHash === tx.transactionHash
            );
            if (index !== -1) {
              // update the item in place
              items[index] = tx;
            } else {
              items.push(tx);
            }
          }
        });

        // set the new items
        setDeposits([...items].sort((a, b) => b.blockNumber - a.blockNumber));

        return data.items;
      },
      { enabled: !!client.address && !!depositsUrl, cacheTime: 30 }
    );

  // does the user have claims available?
  const hasClaims = useMemo(() => {
    const checkForClaims =
      (withdrawals || []).filter((tx) => tx.ready_for_relay && !tx.is_finalized)
        .length > 0;
    return checkForClaims;
  }, [withdrawals]);

  // is the user waiting for a relay to complete?
  const hasPendings = useMemo(() => {
    const checkForWaiting =
      (withdrawals || []).filter((tx) => !tx.ready_for_relay).length > 0;
    return checkForWaiting;
  }, [withdrawals]);

  // get current gas fees for L1
  const l1FeeData = useFeeData({
    chainId: goerli.id,
    formatUnits: "wei",
    cacheTime: 30,
  });

  // get current gas fees for l2
  const l2FeeData = useFeeData({
    chainId: MANTLE_TESTNET_CHAIN.id,
    formatUnits: "wei",
    cacheTime: 30,
  });

  // get current gas fees on selected network
  const feeData = useMemo(
    () =>
      // return the selected chains feeData as default
      chainId === goerli.id ? l1FeeData : l2FeeData,
    [chainId, l1FeeData, l2FeeData]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commitAllowance = () => {
    // check that we're using the corrent network before proceeding
    provider.getNetwork().then((network) => {
      // only run the multicall if we're connected to the correct network
      if (network.chainId === chainId) {
        // direction of the interaction
        const type = chainId === 5 ? Direction.Deposit : Direction.Withdraw;

        // get the selection Token
        const selection =
          (tokens &&
            tokens.find((v) => {
              return selectedToken[type] === v.name && v.chainId === chainId;
            })) ||
          tokens[chainId === 5 ? 0 : 1];

        // native tokens don't need allowance checks (this whole check needs to be moved into a useEffect to update properly)...
        if (
          client.address &&
          bridgeAddress &&
          // L1 native...
          !(
            chainId === 5 &&
            selection.address === "0x0000000000000000000000000000000000000000"
          ) &&
          // L2 native...
          !(
            chainId !== 5 &&
            selection.address === "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
          )
        ) {
          // produce a contract for the selected contract
          const contract = new Contract(
            selection.address,
            TOKEN_ABI,
            multicall?.provider
          );
          // check the allowance the user has allocated to the bridge
          contract
            ?.allowance(client.address, bridgeAddress)
            .catch(() => {
              // eslint-disable-next-line no-console
              // console.log("Allowance call error:", e);
              return parseUnits(allowance, selection.decimals);
            })
            .then((givenAllowance: BigNumberish) => {
              const newAllowance = formatUnits(
                givenAllowance,
                selection.decimals
              ).toString();
              // only trigger an update if we got a new allowance for selected token
              if (newAllowance !== allowance) setAllowance(newAllowance);
            });
        } else if (bridgeAddress) {
          setAllowance(
            formatUnits(constants.MaxUint256, selection.decimals).toString()
          );
        }
      }
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gasEstimate = () => {
    const type = chainId === 5 ? Direction.Deposit : Direction.Withdraw;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHandler = (_e: any) => {
      // invalid state - gas price or 0?
      // return formatUnits(feeData.data?.gasPrice || "0", "gwei")
      //   ?.toString()
      //   .toString();
      return formatUnits("0", "gwei")?.toString().toString();
    };

    if (selectedToken[type] && destinationToken[type] && crossChainMessenger) {
      if (type === Direction.Deposit && destinationToken[type] === "ETH") {
        crossChainMessenger?.estimateGas
          ?.depositETH(destinationTokenAmount || 0, {
            overrides: { from: client?.address },
          })
          ?.catch((e) => errorHandler(e))
          ?.then((val) => {
            // console.log(val.toString());
            setActualGasFee(val.toString());
          });
      } else if (type === Direction.Deposit) {
        const l1Token = MANTLE_TOKEN_LIST.tokens.find((v) => {
          return selectedToken[type] === v.name && v.chainId === 5;
        });
        const l2Token = MANTLE_TOKEN_LIST.tokens.find((v) => {
          return destinationToken[type] === v.name && v.chainId === 5001;
        });
        crossChainMessenger?.estimateGas
          ?.depositERC20(
            l1Token!.address,
            l2Token!.address,
            parseUnits(
              destinationTokenAmount?.toString() || "0",
              l1Token?.decimals
            ), // if we always use zero the tx doesnt revert, but does everything get called?
            { overrides: { from: client?.address } }
          )
          ?.catch((e) => errorHandler(e))
          ?.then((val) => {
            // console.log(val.toString());
            setActualGasFee(val.toString());
          });
      } else if (
        type === Direction.Withdraw &&
        destinationToken[type] === "ETH"
      ) {
        crossChainMessenger?.estimateGas
          ?.withdrawETH(destinationTokenAmount || 0, {
            overrides: { from: client?.address },
          })
          ?.catch((e) => errorHandler(e))
          ?.then((val) => {
            // console.log(val.toString());
            setActualGasFee(val.toString());
          });
      } else if (type === Direction.Withdraw) {
        const l1Token = MANTLE_TOKEN_LIST.tokens.find((v) => {
          return destinationToken[type] === v.name && v.chainId === 5;
        });
        const l2Token = MANTLE_TOKEN_LIST.tokens.find((v) => {
          return selectedToken[type] === v.name && v.chainId === 5001;
        });
        crossChainMessenger?.estimateGas
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
            setActualGasFee(val.toString());
          });
      }
    }
  };

  // debounce the current callback assigned to commitAllowanceRef
  const doCommitAllowanceWithDebounce = useMemo(() => {
    const callback = () => commitAllowanceRef.current?.();
    return debounce(callback, 100);
  }, []);

  // debounce the current callback assigned to gasEstimateRef
  const doGasEstimateWithDebounce = useMemo(() => {
    const callback = () => gasEstimateRef.current?.();
    return debounce(callback, 100);
  }, []);

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

  // update the references every render to make sure we have the latest state in the function
  useEffect(() => {
    commitAllowanceRef.current = commitAllowance;
  }, [commitAllowance]);

  useEffect(() => {
    gasEstimateRef.current = gasEstimate;
  }, [gasEstimate]);

  // make the debounced call when any of the following properties update
  useEffect(
    doCommitAllowanceWithDebounce,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chainId,
      tokens,
      client,
      selectedToken,
      bridgeAddress,
      multicall?.provider,
      manuallyResetAllowance,
      // only required one...
      doCommitAllowanceWithDebounce,
    ]
  );

  useEffect(
    // we only want to perform this action once per change in params
    doGasEstimateWithDebounce,
    // reperform the gas-estimate if anything changes...
    [
      chainId,
      client.address,
      selectedToken,
      destinationToken,
      destinationTokenAmount,
      feeData.data?.gasPrice,
      crossChainMessenger,
      // only required one...
      doGasEstimateWithDebounce,
    ]
  );

  // make sure the multicall contract in the current context is assigned to the current network
  useEffect(() => {
    getMulticallContract(MULTICALL_CONTRACTS[chainId], provider).then(
      async (multicallContract) => {
        setMulticall(multicallContract);
      }
    );
  }, [chainId, provider, client]);

  // perform a multicall on the given network to get all token balances for user
  useEffect(() => {
    if (multicall && client?.address && client?.address !== "0x") {
      // check that we're using the corrent network before proceeding
      multicall.provider.getNetwork().then((network) => {
        // only run the multicall if we're connected to the correct network
        if (network.chainId === chainId) {
          // start loading balances
          setIsLoadingBalances(true);
          // filter any native tokens from the selection
          const filteredTokens = tokens.filter(
            (v) =>
              [
                "0x0000000000000000000000000000000000000000",
                "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
              ].indexOf(v.address) === -1
          );

          // produce a set of balanceOf calls to check users balance against every token
          const calls = filteredTokens.map((token) => {
            return {
              target: token.address as `0x${string}`,
              contract: new Contract(
                token.address,
                TOKEN_ABI,
                multicall.provider
              ),
              fns: [
                {
                  fn: "balanceOf",
                  args: [client?.address as string],
                },
              ],
            };
          });
          // run all calls...
          callMulticallContract(multicall, calls)
            .then(async (responses) => {
              const newBalances = responses.reduce(
                (fillBalances, value, key) => {
                  // copy of the obj
                  const newFillBalances = { ...fillBalances };
                  // set the balance value in to the token details
                  newFillBalances[filteredTokens[key].address] = formatUnits(
                    value.toString(),
                    18
                  );

                  return newFillBalances;
                },
                {} as Record<string, string>
              );

              // update the displayed balances
              setBalances({
                ...newBalances,
                // place the native token balances
                ...(chainId === 5
                  ? {
                      "0x0000000000000000000000000000000000000000":
                        (client.address &&
                          formatUnits(
                            await multicall.provider.getBalance(
                              client.address!
                            ),
                            18
                          )) ||
                        "0",
                    }
                  : {
                      "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000":
                        (client.address &&
                          formatUnits(
                            await multicall.provider.getBalance(
                              client.address!
                            ),
                            18
                          )) ||
                        "0",
                    }),
              });
            })
            .finally(() => {
              // done loading
              setIsLoadingBalances(false);
            });
        } else {
          // clear the balances
          setBalances({});
        }
      });
    } else {
      // clear the balances
      setBalances({});
    }
  }, [chainId, tokens, client, multicall, manuallyResetBalances]);

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

  // keep the l1TxHash ref up to data
  useEffect(() => {
    l1TxHashRef.current = (l1TxHash || "").toString();
  }, [l1TxHash]);

  // keep the l2TxHash ref up to data
  useEffect(() => {
    l2TxHashRef.current = (l2TxHash || "").toString();
  }, [l2TxHash]);

  // tied to the current page being viewed
  useEffect(() => {
    ctaPageRef.current = ctaPage;
  }, [ctaPage]);

  // combine everything into a context provider
  const context = useMemo(() => {
    // when selecting a token by type we also want to set the destination (the corresponding l2 token) and correct the TokenAmounts to prevent overflows
    const setSelectTokenByType = (
      type: keyof StateProps["selectedToken"],
      value: string
    ) => {
      // the opposite of the chain we're working with
      const targetChainID = chainId === 5 ? 5001 : 5;

      // old selection used to build the current selectedTokenAmount
      const oSelection =
        tokens.find((v) => {
          return selectedToken[type] === v.name && v.chainId === chainId;
        }) || tokens[chainId === 5 ? 0 : 1];

      // new selection as per the currently selected chain
      const selection =
        tokens.find((v) => {
          return value === v.name && v.chainId === chainId;
        }) || tokens[chainId === 5 ? 0 : 1];

      // new destination as per the opposite chain
      const destination =
        MANTLE_TOKEN_LIST.tokens.find((v) => {
          return selection.logoURI === v.logoURI && v.chainId === targetChainID;
        }) || tokens[chainId === 5 ? 1 : 0];

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
      isLoadingBalances,

      l1Tx,
      ctaPage,
      ctaPageRef,
      l1TxHash,
      l2TxHash,
      l1TxHashRef,
      l2TxHashRef,
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
      isLoadingDeposits,
      isLoadingWithdrawals,

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

      setL1Tx,
      setCTAPage,
      setCTAChainId,
      setL1TxHash,
      setL2TxHash,
      setCTAStatus,
      setIsCTAPageOpen,

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

    l1Tx,
    ctaPage,
    ctaPageRef,
    l1TxHash,
    l2TxHash,
    l1TxHashRef,
    l2TxHashRef,
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

    tokens,
    balances,
    allowance,
    selectedToken,
    destinationToken,
    selectedTokenAmount,
    destinationTokenAmount,

    ctaErrorReset,

    refetchDepositsPage,
    refetchWithdrawalsPage,
  ]);

  return (
    <StateContext.Provider value={context}>{children}</StateContext.Provider>
  );
}

export default StateContext;
