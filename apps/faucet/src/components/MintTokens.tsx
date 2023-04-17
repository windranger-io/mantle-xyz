"use client";

import React, { useState, useEffect } from "react";

import { useAccount, useBalance, useContractWrite } from "wagmi";
import useIsChainID from "@hooks/useIsChainID";

import { formatEther, getAddress, parseEther } from "ethers/lib/utils.js";
import { truncateAddress } from "@utils/truncateAddress";
import { validate } from "@utils/validateMintData";

import { ABI, NETWORKS, CHAIN_ID, MAX_BALANCE } from "@config/constants";
import useHasTweeted from "@hooks/useHasTweeted";
import { Button, Links, SimpleCard } from "@mantle/ui";
import { Description, Heading } from "./Headings";

function MintTokens({
  tweets,
}: {
  tweets: {
    id: string;
    text: string;
  }[];
}) {
  // check that we're connected to the appropriate chain
  const isChainID = useIsChainID(CHAIN_ID);
  // check that the tweet has been sent
  const hasTweeted = useHasTweeted(tweets);

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [amount, setAmount] = useState<number | undefined>(1);
  const [txs, setTxs] = useState<string[]>([]);

  // record connected wallets bit and eth balance
  const [myBalanceBIT, setmyBalanceBIT] = useState("0.0");
  const [, setmyBalanceETH] = useState("0.0");

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<string>();
  const [sendTo, setSendTo] = useState<string>();
  const { address: wagmiAddress } = useAccount();

  // use wagmi to get balances
  const { data: balanceETH } = useBalance({
    address: wagmiAddress,
    watch: true,
    chainId: CHAIN_ID,
  });
  const { data: balanceBIT } = useBalance({
    address: wagmiAddress,
    watch: true,
    token: NETWORKS[CHAIN_ID],
    chainId: CHAIN_ID,
  });

  // use wagmi to call mint on selected contract
  const { writeAsync: mint, isLoading: minting } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: NETWORKS[CHAIN_ID],
    abi: ABI,
    functionName: "mint",
    async onSettled(data, err) {
      // wait for full resolve
      await data?.wait();

      if (err) {
        setError(
          err.toString().toLowerCase().indexOf("user rejected") !== -1
            ? "User rejected transaction"
            : JSON.stringify(err).toString()
        );
        return false;
      }

      setAmount(undefined);
      setSuccess(
        `Success! We minted ${amount} BIT and sent ${
          (amount || 0) === 1 ? "it" : "them"
        } to ${truncateAddress(address as `0x${string}`)}`
      );
      return true;
    },
  });

  // set wagmi data for ssr
  useEffect(() => {
    setAddress(wagmiAddress);
    setSendTo(wagmiAddress);
  }, [wagmiAddress]);

  useEffect(() => {
    setmyBalanceETH(formatEther(balanceETH?.value || "0"));
    setmyBalanceBIT(formatEther(balanceBIT?.value || "0"));
  }, [balanceETH, balanceBIT]);

  return isChainID && address ? (
    <div className="">
      <div
        className={`${
          minting ? `flex` : `hidden`
        } h-full w-full fixed top-0 left-0 bg-[rgba(255,255,255,0.01)] backdrop-blur-[5px] items-center justify-center`}
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

      <SimpleCard className="max-w-lg grid gap-4">
        <Heading numDisplay="2" header="Set your mint address" />
        <Description>
          Each address can mint 1,000 tokens every 1,000 blocks (about 4 hours).
          Additionally, an address can hold a maximum of 1,000 tokens at any
          time.
        </Description>

        <div
          className={`text-center text-status-success ${
            !success ? `hidden` : `block`
          }`}
        >
          Success! We minted 1 BIT and sent it to 0xBdd8...B5AB
          {success}
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
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
                disabled={
                  minting ||
                  !hasTweeted ||
                  (balanceBIT && parseFloat(myBalanceBIT) >= MAX_BALANCE) ||
                  address === sendTo
                }
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
              disabled={
                minting ||
                !hasTweeted ||
                (balanceBIT && parseFloat(myBalanceBIT) >= MAX_BALANCE)
              }
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => setSendTo(e.target.value as string)}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-sm">Mint token amount</p>
            <input
              type="number"
              required
              id="amount"
              value={amount || ""}
              min="1"
              className="bg-black w-full rounded-input"
              disabled={
                minting ||
                !hasTweeted ||
                (balanceBIT && parseFloat(myBalanceBIT) >= MAX_BALANCE)
              }
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => setAmount(parseFloat(`${e.target.value}`))}
            />
          </div>
          <p
            className={`text-sm ${
              sendTo !== address ||
              minting ||
              !hasTweeted ||
              (balanceBIT &&
                parseFloat(myBalanceBIT) + parseFloat(`${amount}`) >
                  MAX_BALANCE)
                ? ``
                : ""
            }`}
          >
            {balanceBIT &&
            parseFloat(myBalanceBIT) + parseFloat(`${amount}`) > MAX_BALANCE
              ? `Your BIT balance must not exceed 1000 BIT`
              : `You will receive ${amount || 0} BIT`}
          </p>

          <Button
            type="button"
            aria-label="Mint"
            variant="primary"
            size="full"
            disabled={
              sendTo !== address ||
              minting ||
              !hasTweeted ||
              (balanceBIT &&
                parseFloat(myBalanceBIT) + parseFloat(`${amount}`) >
                  MAX_BALANCE)
            }
            onClick={() => {
              const { eAddress, eAmount } = validate(
                address,
                amount || 0,
                myBalanceBIT
              );
              setError(undefined);
              setSuccess(undefined);
              if (!eAddress && !eAmount) {
                // attempt to mint
                mint({
                  recklesslySetUnpreparedArgs: [
                    parseEther(`${amount}`).toString(),
                  ],
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
                setError(
                  "Problems with input or minted tokens exceeds 1000 BIT"
                );
              }
            }}
          >
            Mint Tokens
          </Button>
        </div>
        <div
          className={`bg-slate-900 p-4 rounded-md ${
            !error ? `hidden` : `block`
          }`}
        >
          <div className="text-status-error text-sm">
            {
              // eslint-disable-next-line no-nested-ternary
              sendTo !== address
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
                : address &&
                  balanceBIT &&
                  parseFloat(myBalanceBIT) >= MAX_BALANCE
                ? `Unable to issue more until balance is spent`
                : error
            }
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 py-4">
          <Links
            className="underline text-[#0A8FF6] hover:text-button-primary transition ease-in-out duration-300 cursor-pointer"
            target="blank"
            href="https://faucet.paradigm.xyz/"
          >
            Paradigm gETH Faucet
          </Links>
          <Links
            className="underline text-[#0A8FF6] hover:text-button-primary transition ease-in-out duration-300 cursor-pointer"
            target="blank"
            href="https://goerlifaucet.com/"
          >
            Alchemy gETH Faucet
          </Links>
        </div>
      </SimpleCard>
    </div>
  ) : (
    <div />
  );
}

export default MintTokens;
