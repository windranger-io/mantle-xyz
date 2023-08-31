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
  return (
    <div className="grow sm:my-16 my-10">
      <div className="sm:w-[444px] w-[320px] flex flex-col items-center gap-4 pt-10 pb-5 sm:px-[62px] px-3 rounded-[40px] border border-boxes-containerStroke bg-boxes-containerBg">
        <Typography variant="microBody14">Available NFTs to Mint</Typography>
        <Typography variant="h4PageInfo">
          {remainingNFT === null ? "Loading..." : remainingNFT}
        </Typography>
        {remainingNFT === null || (remainingNFT > 0 && <div>input</div>)}
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
        {!client.isConnected && (
          <div>
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
      </div>
    </div>
  );
}
