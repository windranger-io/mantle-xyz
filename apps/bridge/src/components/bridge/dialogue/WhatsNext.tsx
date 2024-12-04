import { MouseEventHandler } from "react";
import Link from "next/link";
import Image from "next/image";

import CONST from "@mantle/constants";
import { Typography } from "@mantle/ui";
import { DELEGATION_URL, MANTLE_JOURNEY_URL } from "@config/constants";

function WhatNextLink({
  href,
  title,
  description,
  image,
  newTab,
  onClick,
}: {
  href: string;
  title: string;
  description: string;
  image: string;
  newTab: boolean;
  // eslint-disable-next-line react/require-default-props
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
}) {
  return (
    <Link
      href={href}
      target={newTab ? "_blank" : "_self"}
      onClick={(ev) => onClick?.(ev)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 max-w-[95%] mr-2">
          <div className="relative h-[100px] md:min-w-[180px] min-w-[120px] rounded-lg border border-[#1C1E20] bg-black">
            <Image
              fill
              src={image}
              alt={description}
              className="object-contain object-center"
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="modalHeadingSm">{title}</Typography>
            <Typography className="hidden sm:block">{description}</Typography>
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

export default function WhatsNext({ closeModal }: { closeModal: () => void }) {
  // const { chainId } = useContext(StateContext);

  return (
    <div className="relative">
      <button
        type="button"
        className="absolute right-0 top-0"
        onClick={closeModal}
      >
        <span className="sr-only">Close menu</span>
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5 14.1L1.9 24.75C1.66667 24.95 1.4 25.05 1.1 25.05C0.8 25.05 0.533334 24.95 0.3 24.75C0.1 24.5167 0 24.25 0 23.95C0 23.65 0.1 23.3833 0.3 23.15L10.95 12.5L0.35 1.9C0.116667 1.7 0 1.45 0 1.15C0 0.850001 0.1 0.583334 0.3 0.35C0.533334 0.116667 0.8 0 1.1 0C1.4 0 1.66667 0.116667 1.9 0.35L12.5 11L23.1 0.35C23.3333 0.15 23.6 0.0500002 23.9 0.0500002C24.2 0.0500002 24.4667 0.15 24.7 0.35C24.9 0.583334 25 0.850001 25 1.15C25 1.45 24.9 1.71667 24.7 1.95L14.05 12.55L24.7 23.2C24.9 23.4 25 23.65 25 23.95C25 24.25 24.9 24.5 24.7 24.7C24.4667 24.9333 24.2083 25.05 23.925 25.05C23.6417 25.05 23.3833 24.9333 23.15 24.7L12.5 14.1Z"
            fill="white"
          />
        </svg>
      </button>
      <span className="flex justify-between align-middle mb-8">
        <Typography
          variant="modalHeading"
          className="text-center md:w-full w-[80%]"
        >
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
          title="Mantle Journey"
          description="Claim your unique Mantle identity and explore performance-based rewards"
          href={MANTLE_JOURNEY_URL || "#"}
          newTab
        />
      </div>
    </div>
  );
}
