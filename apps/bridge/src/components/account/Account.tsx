import React, { useContext } from "react";
import useCopyToClipboard from "@hooks/useCopyToClipboard";
import StateContext from "@providers/stateContext";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import Link from "next/link";

import { AiOutlineCopy } from "react-icons/ai";
import { RxExternalLink } from "react-icons/rx";
import { Typography } from "@mantle/ui";

import { getAddress } from "ethers/lib/utils.js";
import { CHAINS, Direction, L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import toast from "react-hot-toast";

export default function Account({ selectedTab }: { selectedTab: Direction }) {
  const { client } = useContext(StateContext);

  const { copy } = useCopyToClipboard();
  const handleCopy = () => {
    toast.success("Copied successfully", {
      duration: 2000,
    });
    copy(getAddress(client.address as string));
  };

  return (
    (client && client.address && (
      <div className="flex justify-center space-x-3 items-center">
        <Avatar walletAddress="address" size={54} />
        <Typography variant="bodyLongform" className="grid">
          <span className="truncate block m-0">
            {getAddress(client.address)}
          </span>
        </Typography>

        <div className="flex justify-center space-x-1">
          <AiOutlineCopy onClick={handleCopy} className="cursor-pointer" />
          <Link
            href={`${
              CHAINS[
                selectedTab === Direction.Deposit ? L1_CHAIN_ID : L2_CHAIN_ID
              ].blockExplorerUrls[0]
            }address/${client.address}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            <RxExternalLink />
          </Link>
        </div>
        <br />
      </div>
    )) || <span />
  );
}
