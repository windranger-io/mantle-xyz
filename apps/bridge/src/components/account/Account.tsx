import React, { useContext } from "react";
import useCopyToClipboard from "@hooks/useCopyToClipboard";
import StateContext from "@providers/stateContext";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import Link from "next/link";

import { AiOutlineCopy } from "react-icons/ai";
import { RxExternalLink } from "react-icons/rx";
import { Typography } from "@mantle/ui";

import { getAddress } from "ethers/lib/utils.js";

export default function Account() {
  const { client } = useContext(StateContext);

  const { copy } = useCopyToClipboard();

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
          <AiOutlineCopy
            onClick={() => copy(getAddress(client.address as string))}
            className="cursor-pointer"
          />
          <Link
            href={`https://etherscan.io/address/${client.address}`}
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
