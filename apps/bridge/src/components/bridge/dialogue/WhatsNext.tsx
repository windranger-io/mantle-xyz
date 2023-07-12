import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";

import CONST from "@mantle/constants";
import { Typography } from "@mantle/ui";

import StateContext from "@providers/stateContext";
// import { useToast } from "@hooks/useToast";
import { DELEGATION_URL, MANTLE_BRIDGE_URL } from "@config/constants";
import AddNetworkBtn from "@components/bridge/dialogue/AddNetworkBtn";

function WhatNextLink({
  href,
  title,
  description,
  image,
  newTab,
}: {
  href: string;
  title: string;
  description: string;
  image: string;
  newTab: boolean;
}) {
  return (
    <Link href={href} target={newTab ? "_blank" : "_self"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative h-[100px] md:w-[180px] w-[140px] rounded-lg border border-[#1C1E20] bg-black">
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
        {/* chevron right */}
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

export default function WhatsNext() {
  // const { createToast } = useToast();
  const { chainId } = useContext(StateContext);

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading" className="text-center w-full mt-4">
          What to do next?
        </Typography>
      </span>
      <div className="pr-2">
        <WhatNextLink
          image="/deposited/explore.png"
          title="Explore Dapps"
          description="Lend your tokens or generate yield"
          href={CONST.NAV_LINKS_ABSOLUTE.ECOSYSTEM_LINK}
          newTab
        />
        <WhatNextLink
          image="/deposited/delegate.png"
          title="Delegate"
          description="Participate in Mantle's governance"
          href={DELEGATION_URL}
          newTab
        />
        <WhatNextLink
          image="/deposited/bridge.png"
          title="Bridge"
          description="Move your tokens to Mantle Network"
          href={MANTLE_BRIDGE_URL[chainId] || "#"}
          newTab={false}
        />
      </div>
      <div>
        <AddNetworkBtn />
      </div>
    </>
  );
}
