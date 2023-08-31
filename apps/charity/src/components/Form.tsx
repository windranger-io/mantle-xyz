"use client";

import { useContext, useEffect, useState } from "react";

import { Button, Typography } from "@mantle/ui";
import { maxNFTSupply, L1_NFT_ADDRESS } from "@config/constants";
import { useTotalMinted } from "@hooks/web3/read";
import StateContext from "@providers/stateContext";

export default function Form() {
  const { client, setWalletModalOpen } = useContext(StateContext);

  const { isFetchingTotalMinted, totalMinted } = useTotalMinted(L1_NFT_ADDRESS);
  const [remainingNFT, setRemainingNFT] = useState<number | null>(null);

  useEffect(() => {
    if (!isFetchingTotalMinted) {
      setRemainingNFT(maxNFTSupply - Number(totalMinted));
    }
  }, [isFetchingTotalMinted, totalMinted]);

  let remainingCopy;
  if (remainingNFT === null) {
    remainingCopy = "Loading...";
  } else if (remainingNFT <= 0) {
    remainingCopy = "Fully Minted";
  } else {
    remainingCopy = remainingNFT;
  }

  const [numOfToken, setNumOfToken] = useState<number | string>(1);

  return (
    <div className="grow sm:my-16 my-10">
      <div className="sm:w-[444px] w-[320px] flex flex-col items-center gap-4 pt-10 pb-5 sm:px-[62px] px-3 rounded-[40px] border border-boxes-containerStroke bg-boxes-containerBg">
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
              max={remainingNFT !== null && remainingNFT < 5 ? remainingNFT : 5}
              className="grow text-center bg-black focus:ring-0 focus:ring-white/70 focus:outline-none border-0 appearance-none"
              onChange={(e) => {
                setNumOfToken(`${Math.abs(+(e.target.value || "")) || ""}`);
              }}
            />
            <button
              type="button"
              disabled={
                Number(numOfToken) >=
                (remainingNFT !== null && remainingNFT < 5 ? remainingNFT : 5)
              }
              onClick={() => setNumOfToken((prev) => Number(prev) + 1)}
              className={`${
                Number(numOfToken) >=
                (remainingNFT !== null && remainingNFT < 5 ? remainingNFT : 5)
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
                    Number(numOfToken) >=
                    (remainingNFT !== null && remainingNFT < 5
                      ? remainingNFT
                      : 5)
                      ? "#696969"
                      : "white"
                  }
                />
                <path
                  d="M15.25 16.75H9.5V15.25H15.25V9.5H16.7499V15.25H22.5V16.75H16.7499V22.5H15.25V16.75Z"
                  fill={
                    Number(numOfToken) >=
                    (remainingNFT !== null && remainingNFT < 5
                      ? remainingNFT
                      : 5)
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
          <div className="mb-6 w-full">
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
        {/* TODO: Mint NFT Button */}
        {client.isConnected && remainingNFT !== null && remainingNFT > 0 ? (
          <div className="mb-6 w-full">
            <Button
              type="button"
              size="full"
              variant="secondary"
              disabled={
                Number(numOfToken) >
                  (remainingNFT !== null && remainingNFT < 5
                    ? remainingNFT
                    : 5) || Number(numOfToken) < 1
              }
              // onClick={() => console.log("TODO")}
            >
              {Number(numOfToken) >
                (remainingNFT !== null && remainingNFT < 5
                  ? remainingNFT
                  : 5) || Number(numOfToken) < 1
                ? "Invalid mint amount"
                : "Mint NFT"}
            </Button>
          </div>
        ) : null}

        {/* Fully Minted Button */}
        {remainingNFT === 0 ? (
          <div className="mb-6 w-full">
            <Button type="button" size="full" variant="secondary" disabled>
              NFT Collection Fully Minted
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
