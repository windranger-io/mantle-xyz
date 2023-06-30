import {
  CHAINS,
  L1_BITDAO_TOKEN,
  L1_BITDAO_TOKEN_ADDRESS,
  L1_MANTLE_TOKEN,
  MANTLE_BRIDGE_URL,
  DELEGATION_URL,
} from "@config/constants";

import { Button, Typography } from "@mantle/ui";
import CONST from "@mantle/constants";
import { useAddToken } from "@hooks/web3/write/useAddToken";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@hooks/useToast";
import { useContext, useEffect, useMemo } from "react";
import StateContext from "@providers/stateContext";
import { parseUnits } from "ethers/lib/utils.js";
import MetamaskSvg from "public/converted/metamask.svg";

function WhatNextLink({
  href,
  title,
  description,
  image,
}: {
  href: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <Link href={href} target="_blank">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative h-[100px] w-[180px] rounded-lg border border-[#1C1E20] bg-black">
            <Image
              fill
              src={image}
              alt={description}
              className="object-contain object-center"
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="modalHeadingSm">{title}</Typography>
            <Typography>{description}</Typography>
          </div>
        </div>
        <svg
          width="9"
          height="16"
          viewBox="0 0 9 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path
              d="M1.50147 0.249999L8.35547 7.105C8.4388 7.18767 8.50114 7.27767 8.54247 7.375C8.58447 7.47233 8.60547 7.56967 8.60547 7.667C8.60547 7.76433 8.58447 7.86167 8.54247 7.959C8.50114 8.05633 8.4388 8.14633 8.35547 8.229L1.48047 15.105C1.2998 15.285 1.0948 15.375 0.865469 15.375C0.636136 15.375 0.431469 15.278 0.251469 15.084C0.0708018 14.9313 -0.0125312 14.7263 0.00146874 14.469C0.0148021 14.2123 0.104802 14.0007 0.271469 13.834L6.45947 7.667L0.25147 1.459C0.0981362 1.30567 0.0214704 1.10433 0.0214704 0.854999C0.0214704 0.604332 0.0981363 0.402666 0.25147 0.249999C0.418137 0.0833323 0.62647 -6.97546e-07 0.87647 -6.75691e-07C1.12647 -6.53835e-07 1.3348 0.0833324 1.50147 0.249999Z"
              fill="white"
            />
          </g>
        </svg>
      </div>
    </Link>
  );
}

export default function Deposited({
  txHash,
  from,
  closeModal,
}: {
  txHash: string | boolean;
  from: string;
  closeModal: () => void;
}) {
  const { addToken } = useAddToken();
  const { createToast } = useToast();
  const { chainId, isLoadingBalances, balances } = useContext(StateContext);

  useEffect(() => {
    if (typeof txHash === "string") {
      createToast({
        type: "success",
        borderLeft: "bg-green-600",
        content: (
          <div className="flex flex-col">
            <Typography variant="body">
              <b>Success Conversion completed</b>
            </Typography>
            <Typography variant="body">{from} BIT converted to MNT</Typography>
          </div>
        ),
        id: txHash,
        buttonText: "Etherscan",
        onButtonClick: () => {
          window.open(
            `${CHAINS[chainId].blockExplorerUrls}tx/${txHash}`,
            "_blank"
          );

          return true;
        },
      });
    }
  }, [txHash]);

  // get the balance/allowanace details
  const BITBalance = useMemo(() => {
    return balances?.[L1_BITDAO_TOKEN_ADDRESS] || "0";
  }, [balances]);

  const hasBitBalanceRemaining = parseUnits(
    balances[L1_BITDAO_TOKEN.address] || "-1",
    L1_BITDAO_TOKEN.decimals
  ).gte(parseUnits("0", L1_BITDAO_TOKEN.decimals));

  useEffect(() => {
    if (
      !isLoadingBalances &&
      typeof txHash === "string" &&
      hasBitBalanceRemaining
    ) {
      createToast({
        type: "success",
        borderLeft: "bg-yellow-500",
        content: (
          <div className="flex flex-col">
            <Typography variant="body">
              <b>You still have remaining BIT tokens</b>
            </Typography>
            <Typography variant="body">
              Would you like to convert the rest now?
            </Typography>
          </div>
        ),
        id: `${txHash}-remaining-balance`,
        buttonText: "Convert",
        onButtonClick: () => {
          closeModal();

          return true;
        },
      });
    }
  }, [isLoadingBalances, txHash, BITBalance, hasBitBalanceRemaining]);

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading" className="text-center w-full mt-4">
          What to do next with MNT?
        </Typography>
      </span>
      <div className="pr-2">
        <WhatNextLink
          image="/converted/link-1.png"
          title="Delegate"
          description="Participate in Mantle's governance"
          href={DELEGATION_URL}
        />
        <WhatNextLink
          image="/converted/link-2.png"
          title="Bridge"
          description="Move your tokens to Mantle Network"
          href={MANTLE_BRIDGE_URL[chainId] || "#"}
        />
        <WhatNextLink
          image="/converted/link-3.png"
          title="Explore Dapps"
          description="Lend your tokens or generate yield"
          href={CONST.NAV_LINKS_ABSOLUTE.ECOSYSTEM_LINK}
        />
      </div>
      <div>
        <Button
          type="button"
          size="full"
          className="h-14 flex flex-row gap-4 text-center items-center justify-center my-4"
          variant="dark"
          onClick={() => addToken(L1_MANTLE_TOKEN)}
        >
          <Image src={MetamaskSvg} alt="metamask" height={26} width={26} />
          Add MNT to Wallet
        </Button>
      </div>
      <Typography className="text-center">
        If you don&apos;t see MNT tokens in your wallet click this button
      </Typography>
    </>
  );
}
