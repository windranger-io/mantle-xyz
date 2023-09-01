"use client";

import { useContext, useEffect, useState } from "react";
import { useContractWrite } from "wagmi";
import { BigNumber } from "ethers";

import { Button, Typography } from "@mantle/ui";
import {
  maxCharityNFTSupply,
  L1_NFT_ADDRESS,
  L1_NFT_CONTRACT_ABI,
} from "@config/constants";
import { useTotalMinted, useUserClaimedSupply } from "@hooks/web3/read";
import StateContext from "@providers/stateContext";
import useCurrentClaimPhase from "@hooks/web3/read/useCurrentClaimPhase";
import TxDialog from "./Dialog";

export default function Form() {
  const { client, setWalletModalOpen } = useContext(StateContext);

  const { isFetchingTotalMinted, totalMinted, resetTotalMinted } =
    useTotalMinted(L1_NFT_ADDRESS);
  const [remainingNFT, setRemainingNFT] = useState<number | null>(null);

  useEffect(() => {
    if (!isFetchingTotalMinted) {
      setRemainingNFT(maxCharityNFTSupply - Number(totalMinted));
    }
  }, [isFetchingTotalMinted, totalMinted]);

  let remainingCopy;
  if (remainingNFT === null) {
    remainingCopy = "Loading...";
  } else if (remainingNFT <= 0) {
    remainingCopy = "Fully Minted";
  } else {
    remainingCopy = `${remainingNFT} of ${maxCharityNFTSupply}`;
  }

  const [numOfToken, setNumOfToken] = useState<number | string>(1);

  // get current claim condition
  const {
    currentCondition,
    activeClaimConditionId,
    isFetchingActiveClaimConditionId,
  } = useCurrentClaimPhase(L1_NFT_ADDRESS);

  const hasActivePhase =
    !isFetchingActiveClaimConditionId && activeClaimConditionId !== undefined;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  // get user claimed supply
  const { userClaimedAmount, resetUserClaimedAmount } = useUserClaimedSupply(
    L1_NFT_ADDRESS,
    activeClaimConditionId,
    client?.address
  );

  const maxPerWallet = (
    currentCondition as any
  )?.quantityLimitPerWallet.toNumber();

  const userMaxMintableAmount =
    remainingNFT !== null && remainingNFT < maxPerWallet
      ? remainingNFT - Number(userClaimedAmount)
      : maxPerWallet - Number(userClaimedAmount); // fallback to 5 when not yet loaded the data

  const maxMintableAmount = Number.isNaN(userMaxMintableAmount)
    ? 5
    : userMaxMintableAmount;

  // claim NFT
  const { isLoading: isClaimLoading, write: claim } = useContractWrite({
    address: L1_NFT_ADDRESS,
    abi: L1_NFT_CONTRACT_ABI,
    functionName: "claim",
    onSuccess(data) {
      // set tx hash
      if (data.hash) {
        setTxHash(data.hash);
      }
      // open pending dialog
      setIsOpen(true);
    },
    onError(error) {
      if (error.toString().includes("!Tokens")) {
        setErrorMsg(
          "Invalid mint amount: exceeds available NFTs to mint, please refresh the page and try again."
        );
        resetTotalMinted();
      } else if (error.toString().includes("User rejected the request.")) {
        // don't show error msg since this is user decision
        setErrorMsg("");
      } else if (error.toString().includes("!Qty")) {
        setErrorMsg(
          "You have already minted the max. amount of NFTs allowed per wallet address"
        );
      } else if (
        error
          .toString()
          .includes(
            "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
          )
      ) {
        setErrorMsg(
          "Insufficient gas fee for the mint, please top up with ETH and try again"
        );
      } else {
        setErrorMsg(
          "Something went wrong, please refresh the page and try again."
        );
      }
    },
  });

  return (
    <div className="grow sm:my-16 my-10">
      <div className="sm:w-[444px] w-[320px] flex flex-col items-center gap-4 pt-10 pb-11 sm:px-[62px] px-3 rounded-[40px] border border-boxes-containerStroke bg-boxes-containerBg">
        <Typography variant="microBody14">Available NFTs to Mint</Typography>
        {/* desktop title */}
        <Typography
          variant="h4PageInfo"
          className="hidden sm:block text-center"
        >
          {remainingCopy}
        </Typography>
        {/* mobile title */}
        <Typography variant="h5Title" className="sm:hidden block text-center">
          {remainingCopy}
        </Typography>
        {/* input */}
        {remainingNFT === null || remainingNFT > 0 ? (
          <div className="flex justify-between items-center p-2 rounded-[40px] border border-stroke-inputs bg-boxes-containerBg w-full">
            <button
              type="button"
              disabled={Number(numOfToken) <= 1}
              onClick={() => setNumOfToken((prev) => Number(prev) - 1)}
              className={`${
                Number(numOfToken) <= 1
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              } h-8 w-8`}
            >
              {/* minus icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="15.5"
                  stroke={Number(numOfToken) <= 1 ? "#696969" : "white"}
                />
                <path
                  d="M9.5 16.7499V15.25H22.5V16.7499H9.5Z"
                  fill={Number(numOfToken) <= 1 ? "#696969" : "white"}
                />
              </svg>
            </button>
            <input
              type="number"
              required
              id="numOfToken"
              value={numOfToken}
              min={1}
              max={maxMintableAmount}
              className="grow text-center bg-black focus:ring-0 focus:ring-white/70 focus:outline-none border-0 appearance-none"
              onChange={(e) => {
                setNumOfToken(`${Math.abs(+(e.target.value || "")) || ""}`);
              }}
            />
            <button
              type="button"
              disabled={Number(numOfToken) >= maxMintableAmount}
              onClick={() => setNumOfToken((prev) => Number(prev) + 1)}
              className={`${
                Number(numOfToken) >= maxMintableAmount
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              } h-8 w-8`}
            >
              {/* plus icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="15.5"
                  stroke={
                    Number(numOfToken) >= maxMintableAmount
                      ? "#696969"
                      : "white"
                  }
                />
                <path
                  d="M15.25 16.75H9.5V15.25H15.25V9.5H16.7499V15.25H22.5V16.75H16.7499V22.5H15.25V16.75Z"
                  fill={
                    Number(numOfToken) >= maxMintableAmount
                      ? "#696969"
                      : "white"
                  }
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="h-12" /> // empty space when not showing input
        )}
        {/* Static info of NFT collection */}
        <div className="w-full">
          <div className="flex justify-between items-center gap-2">
            <Typography variant="smallWidget16">Price per NFT</Typography>
            <Typography variant="smallWidget16" className="text-type-primary">
              0.1337 ETH
            </Typography>
          </div>
          <div className="flex justify-between items-center gap-2 mt-2">
            <Typography variant="smallWidget16">
              Max. per wallet address
            </Typography>
            <Typography variant="smallWidget16" className="text-type-primary">
              5 NFTs
            </Typography>
          </div>
        </div>
        {/* Connect Wallet Button */}
        {!client.isConnected && remainingNFT !== 0 && (
          <div className="w-full">
            <Button
              type="button"
              size="full"
              variant="secondary"
              onClick={() => setWalletModalOpen(true)}
            >
              Connect Wallet
            </Button>
          </div>
        )}

        {/* Mint NFT Button */}
        {client?.address &&
        currentCondition &&
        remainingNFT !== null &&
        remainingNFT > 0 &&
        maxMintableAmount > 0 ? (
          <div className="w-full">
            <Button
              type="button"
              size="full"
              variant="secondary"
              disabled={
                Number(numOfToken) > maxMintableAmount ||
                Number(numOfToken) < 1 ||
                !hasActivePhase
              }
              onClick={() => {
                claim({
                  args: [
                    client.address, // _receiver
                    BigNumber.from(numOfToken), // _quantity
                    (currentCondition as any)?.currency, // _currency
                    (currentCondition as any)?.pricePerToken, // _pricePerToken
                    {
                      proof: [(currentCondition as any)?.merkleRoot],
                      quantityLimitPerWallet: (currentCondition as any)
                        ?.quantityLimitPerWallet,
                      pricePerToken: (currentCondition as any)?.pricePerToken,
                      currency: (currentCondition as any)?.currency,
                    }, // _allowlistProof
                    "0x", // _data
                  ],
                  value: (currentCondition as any)?.pricePerToken.mul(
                    numOfToken
                  ),
                });
              }}
            >
              <div className="flex flex-row gap-4 items-center mx-auto w-fit">
                <span>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {!hasActivePhase
                    ? "No active claim phase"
                    : Number(numOfToken) > maxMintableAmount ||
                      Number(numOfToken) < 1
                    ? "Invalid mint amount"
                    : "Mint NFT"}
                </span>
                {isClaimLoading ? (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </Button>
          </div>
        ) : null}

        {/* Fully Minted Button or minted max limit */}
        {/* eslint-disable-next-line no-nested-ternary */}
        {remainingNFT === 0 ? (
          <div className="w-full">
            <Button type="button" size="full" variant="secondary" disabled>
              NFT Collection Fully Minted
            </Button>
          </div>
        ) : maxMintableAmount <= 0 ? (
          <div className="w-full">
            <Button type="button" size="full" variant="secondary" disabled>
              <div className="flex flex-row gap-4 items-center mx-auto w-fit">
                <span>Minted max. limit</span>
              </div>
            </Button>
          </div>
        ) : null}

        {/* Error message */}
        {errorMsg && (
          <Typography variant="smallWidget16" className="text-type-error">
            {errorMsg}
          </Typography>
        )}
      </div>

      {txHash && (
        <TxDialog
          txHash={txHash}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          numOfToken={Number(numOfToken)}
          resetUserClaimedAmount={resetUserClaimedAmount}
        />
      )}
    </div>
  );
}
