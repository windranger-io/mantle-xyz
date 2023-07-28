/* eslint-disable no-nested-ternary */

"use client";

import React, { useState, useEffect, useContext } from "react";

import {
  useAccount,
  useBalance,
  useBlockNumber,
  useContractWrite,
  useQuery,
} from "wagmi";
import useIsChainID from "@hooks/useIsChainID";
import { useSession } from "next-auth/react";

import {
  formatEther,
  getAddress,
  parseEther,
  // isAddress,
} from "ethers/lib/utils.js";
import { validate } from "@utils/validateMintData";

import {
  ABI,
  NETWORKS,
  L1_CHAIN_ID,
  MAX_BALANCE,
  MAX_MINT,
} from "@config/constants";
import { truncateAddress, formatBigNumberString } from "@mantle/utils";
import { BigNumber, Contract } from "ethers";
import StateContext from "@providers/stateContext";

import { Button, SimpleCard, Typography } from "@mantle/ui";

import { CardHeading } from "./CardHeadings";
import ConnectWallet from "./ConnectWallet";

// format according to the given locale
const MAX_MINT_FORMATTED = formatBigNumberString(
  `${MAX_MINT || 0}`,
  18,
  true,
  false
);

function MintTokens() {
  // check that we're connected to the appropriate chain
  const isChainID = useIsChainID(L1_CHAIN_ID);
  // check that user is authenticated
  const { data: session } = useSession();

  // import the provider
  const { provider } = useContext(StateContext);

  const [error, setError] = useState<string | undefined>();
  const [hasMintError, setHasMintError] = useState<boolean | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [amount, setAmount] = useState<string | undefined>("1");
  const [txs, setTxs] = useState<string[]>([]);

  // record connected wallets bit and eth balance
  const [myBalanceMNT, setmyBalanceMNT] = useState("0.0");
  const [, setmyBalanceETH] = useState("0.0");

  // check if minting should be locked (set appropriate error when detected)
  const [mintLock, setMintLock] = useState(false);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<string>();
  const [sendTo, setSendTo] = useState<string>();
  const [blockNumber, setBlockNumber] = useState<string>();
  const { address: wagmiAddress } = useAccount();

  // use wagmi to get balances
  const { data: balanceETH } = useBalance({
    address: wagmiAddress,
    watch: true,
    chainId: L1_CHAIN_ID,
  });
  const { data: balanceMNT } = useBalance({
    address: wagmiAddress,
    watch: true,
    token: NETWORKS[L1_CHAIN_ID],
    chainId: L1_CHAIN_ID,
  });

  // current blockNumber
  useBlockNumber({
    chainId: L1_CHAIN_ID,
    watch: true,
    onBlock: (data) => {
      setBlockNumber(data?.toString());
    },
  });

  // get the users mint record from the contract
  const { data: mintRecord, refetch: refetchMintRecord } = useQuery(
    [
      "MINT_RECORD",
      {
        wagmiAddress,
        client: sendTo,
        provider: provider.network.chainId,
      },
    ],
    async () => {
      if (
        sendTo &&
        provider?.network?.chainId === L1_CHAIN_ID &&
        NETWORKS[L1_CHAIN_ID]
      ) {
        const contract = new Contract(NETWORKS[L1_CHAIN_ID], ABI, provider);
        const record = await contract.mintRecord(sendTo);

        return BigNumber.from(record).toNumber();
      }
      return 0;
    },
    {
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

  // use wagmi to call mint on selected contract
  const { writeAsync: mint, isLoading: minting } = useContractWrite({
    address: NETWORKS[L1_CHAIN_ID],
    abi: ABI,
    functionName: "mint",
    // check for transaction success on settled
    async onSettled(data, err) {
      // check for error first...
      if (err) {
        const stringErr = err.message.toLowerCase();
        setError(
          stringErr.indexOf("user rejected") !== -1
            ? "User rejected transaction"
            : stringErr.indexOf("intrinsic gas too low") !== -1
            ? "Intrinsic gas too low"
            : `${err.message}`
        );
        return false;
      }

      // clear errors between calls
      setError("");

      // wait for one confirmation
      const receipt = await provider
        .waitForTransaction(data?.hash || "", 1)
        .catch((e: any) => {
          throw e;
        });

      // fetch the mint-record again to check for warning states
      await refetchMintRecord();

      // check that the transaction actually succeeded
      if (parseInt(receipt?.status?.toString() || "0x0", 16) === 1) {
        setAmount(undefined);
        setSuccess(
          `Success!\n We minted ${formatBigNumberString(
            `${amount || 0}`,
            18,
            true,
            false
          )} MNT and sent ${
            +(amount || 0) === 1 ? "it" : "them"
          } to ${truncateAddress(address as `0x${string}`)}\n\n`
        );

        return true;
      }

      // didnt succeed report failure
      setError("Transaction failed - did the transaction run out of gas?");

      return false;
    },
    async onError(err) {
      // mark appropriate error
      setError(
        err.toString().toLowerCase().indexOf("user rejected") !== -1
          ? "User rejected transaction"
          : `1 - ${err.message}`
      );
    },
  });

  // set wagmi data for ssr
  useEffect(() => {
    setError("");
    setAddress(wagmiAddress);
    setSendTo(wagmiAddress);
  }, [wagmiAddress]);

  useEffect(() => {
    setmyBalanceETH(formatEther(balanceETH?.value || "0"));
    setmyBalanceMNT(formatEther(balanceMNT?.value || "0"));
  }, [balanceETH, balanceMNT]);

  useEffect(() => {
    const hasError =
      error === "" ||
      error ===
        `You can mint a maximum of ${MAX_MINT_FORMATTED} MNT per transaction` ||
      error?.indexOf("Please wait 1,000 blocks starting from") === 0 ||
      error?.indexOf("Warning: Balance will equal or exceed 1,000 MNT") === 0;

    setHasMintError(hasError);
  }, [error]);

  useEffect(() => {
    // clear the error on change if required
    if (!hasMintError) {
      // clear the error
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  useEffect(() => {
    // check if the error is to be set
    if (blockNumber && typeof mintRecord !== "undefined" && hasMintError) {
      // check mintable conditions
      const validBlock =
        mintRecord === 0 || +(blockNumber || 0) - (mintRecord || 0) > 1000;
      const validBalance = balanceMNT && +`${myBalanceMNT || 0}` < MAX_BALANCE;
      const validFutureBalance =
        balanceMNT && +`${myBalanceMNT || 0}` + +`${amount || 0}` < MAX_BALANCE;

      // mintable when both are valid
      setMintLock(!(validBlock || validBalance));

      // place appropriate error
      if (+(amount || 0) > MAX_MINT) {
        // wait the block time
        setError(
          `You can mint a maximum of ${MAX_MINT_FORMATTED} MNT per transaction`
        );
      } else if (!validBlock && !validBalance) {
        // wait the block time
        setError(
          `Please wait 1,000 blocks starting from ${mintRecord} before attempting to mint more tokens (current block: ${blockNumber})`
        );
      } else if (!validFutureBalance) {
        // balance is more than max allowed (in block time - but we're imposing this all the time)
        setError(
          `Warning: Balance will equal or exceed 1,000 MNT (current balance: ${myBalanceMNT} MNT)`
        );
      } else if (
        error ===
          `You can mint a maximum of ${MAX_MINT_FORMATTED} MNT per transaction` ||
        error?.indexOf("Please wait 1,000 blocks starting from") === 0 ||
        error?.indexOf("Warning: Balance will equal or exceed 1,000 MNT") === 0
      ) {
        // clear the error
        setError("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sendTo,
    mintRecord,
    blockNumber,
    balanceMNT,
    myBalanceMNT,
    amount,
    hasMintError,
  ]);

  return (
    <SimpleCard className="max-w-lg grid gap-4">
      <CardHeading numDisplay="2" header="Set your mint amount" />
      <Typography variant="body" className="mb-4">
        If your wallet holds 1,000 MNT or more you must wait 1,000 blocks (about
        4 hours) before you can perform another mint operation.
      </Typography>

      {/* hide avatar and disconnect to avoid waiting for wallet connect to load */}
      <div className={`${!address ? `block` : `hidden`} wallet-full`}>
        <ConnectWallet />
      </div>
      {isChainID && address ? (
        <div className="">
          <div
            className={`${
              minting ? `flex` : `hidden`
            } h-full w-full fixed top-0 left-0 bg-[rgba(255,255,255,0.01)] backdrop-blur-[5px] items-center justify-center z-10`}
          >
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-16 h-16 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Minting...</span>
            </div>
          </div>

          <div
            className={`text-center whitespace-pre-wrap text-status-success mb-4 ${
              !success ? `hidden` : `block`
            }`}
          >
            {success}
          </div>

          <div className="grid gap-6">
            {/* <div className="grid gap-2">
              <div className="flex flex-row gap-2">
                <p className="text-sm">Mint address</p>

                <Button
                  variant="link"
                  type="button"
                  className="text-button-primary"
                  style={{
                    padding: "0px",
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                  }}
                  // disabled={
                  //   minting ||
                  //   !hasTweeted ||
                  //   (balanceMNT && parseFloat(myBalanceMNT) >= MAX_BALANCE) ||
                  //   address === sendTo
                  // }
                  onClick={() => setSendTo(address || "")}
                >
                  Send to my address
                </Button>
              </div>

              <input
                type="text"
                required
                id="sendTo"
                value={sendTo}
                placeholder="0x1234..."
                className="bg-black w-full rounded-input"
                // disabled={
                //   minting ||
                //   !hasTweeted ||
                //   (balanceMNT && parseFloat(myBalanceMNT) >= MAX_BALANCE)
                // }
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setSendTo(e.target.value as string)}
              />

              {isAddress(sendTo as string) ? null : (
                <div className="text-status-error text-sm">
                  Please enter valid address
                </div>
              )}
            </div> */}
            <div className="grid gap-2">
              <p className="text-sm">Mint token amount</p>
              <input
                type="number"
                required
                id="amount"
                value={amount || ""}
                min="1"
                className="bg-black w-full rounded-input"
                // disabled={
                //   minting ||
                //   !hasTweeted ||
                //   (balanceMNT && parseFloat(myBalanceMNT) >= MAX_BALANCE)
                // }
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => {
                  // pass the targer amount
                  setAmount(`${e.target.value}`);
                }}
              />
            </div>
            <p
              className={`text-sm whitespace-pre-wrap ${
                !session?.user?.access_token ||
                sendTo !== address ||
                +(amount || 0) > MAX_MINT ||
                minting ||
                mintLock
                  ? // !hasTweeted ||
                    // (balanceMNT && +myBalanceMNT + +`${amount}` > MAX_BALANCE)
                    "hidden"
                  : "block"
              }`}
            >
              {+(amount || 0) > MAX_MINT
                ? `You can mint a maximum of ${MAX_MINT_FORMATTED} MNT per transaction`
                : balanceMNT && mintLock
                ? `Your MNT balance exceeds 1,000 MNT and you have performed a mint action in the last 1,000 blocks...`
                : balanceMNT && +myBalanceMNT + +`${amount}` > MAX_BALANCE
                ? `You will receive ${formatBigNumberString(
                    `${amount || 0}`,
                    18,
                    true,
                    false
                  )} MNT.\n\nAfter this transaction, your balance will equal or exceed 1,000 MNT and you will be locked out from performing any more mints for 1,000 blocks.`
                : `You will receive ${
                    formatBigNumberString(`${amount || 0}`, 18, true, false) ||
                    0
                  } MNT`}
            </p>

            <Button
              type="button"
              aria-label="Mint"
              variant="primary"
              size="full"
              disabled={
                !session?.user?.access_token ||
                sendTo !== address ||
                +(amount || 0) > MAX_MINT ||
                minting ||
                mintLock
              }
              onClick={() => {
                const { eAddress, eAmount } = validate(address, amount || 0);
                setSuccess(undefined);
                if (!eAddress && !eAmount) {
                  // attempt to mint
                  mint({
                    args: [BigInt(parseEther(`${amount}`).toString())],
                  })
                    .then((tx: { hash: string }) => {
                      if (tx.hash) {
                        setTxs([...txs, tx.hash]);
                      }
                    })
                    .catch((err: any) => {
                      if (!error) {
                        setError(
                          err
                            .toString()
                            .toLowerCase()
                            .indexOf("user rejected") !== -1
                            ? "User rejected transaction"
                            : JSON.stringify(err).toString()
                        );
                      }
                    });
                } else {
                  setError("Problems with input");
                }
              }}
            >
              Mint Tokens
            </Button>
          </div>
          <div
            className={`bg-slate-900 p-4 mt-4 rounded-md ${
              !error || !session?.user?.access_token ? `hidden` : `block`
            }`}
          >
            <div
              className={`${
                error?.indexOf("Warning:") === 0
                  ? "text-white"
                  : "text-status-error"
              } text-sm`}
            >
              {sendTo !== address
                ? `Please connect ${
                    sendTo &&
                    sendTo.length === 42 &&
                    (() => {
                      try {
                        return getAddress(sendTo);
                      } catch {
                        return false;
                      }
                    })()
                      ? `${truncateAddress(
                          (sendTo as `0x${string}`) || "0x0"
                        )}s`
                      : ""
                  } wallet to mint`
                : error}
            </div>
          </div>
        </div>
      ) : null}
    </SimpleCard>
  );
}

export default MintTokens;
