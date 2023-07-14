import React, { useContext } from "react";
import { getAddress } from "ethers/lib/utils.js";
import Link from "next/link";
import { AiOutlineCopy } from "react-icons/ai";
import { RxExternalLink } from "react-icons/rx";

import { Typography } from "@mantle/ui";
import Avatar from "@mantle/ui/src/presentational/Avatar";

import useCopyToClipboard from "@hooks/useCopyToClipboard";
import StateContext from "@providers/stateContext";
import { CHAINS, L1_CHAIN_ID } from "@config/constants";

export default function Account() {
  const { client } = useContext(StateContext);

  const { copy } = useCopyToClipboard();

  return (
    (client && client.address && (
      <div className="flex flex-wrap gap-3 justify-center items-center">
        <Avatar walletAddress="address" size={54} />
        <Typography variant="bodyLongform" className="grid">
          <span className="truncate block m-0">
            {getAddress(client.address)}
          </span>
        </Typography>

        <div className="flex justify-center space-x-1">
          <AiOutlineCopy
            onClick={() => copy(getAddress(client.address as string))}
            className="cursor-pointer"
          />
          <Link
            href={`${CHAINS[L1_CHAIN_ID].blockExplorerUrls[0]}address/${client.address}`}
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
