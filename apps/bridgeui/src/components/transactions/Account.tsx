import useCopyToClipboard from "@hooks/useCopyToClipboard";
import { Typography } from "@mantle/ui";
import Avatar from "@mantle/ui/src/presentational/Avatar";
import Link from "next/link";
import { AiOutlineCopy } from "react-icons/ai";
import { RxExternalLink } from "react-icons/rx";

export default function Account() {
  const address = "0x71C7656EC7ab88b098defB751B7401B5f6d897";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, copy] = useCopyToClipboard();
  return (
    <div className="flex justify-center space-x-3 items-center">
      <Avatar walletAddress="address" size={54} />
      <Typography variant="bodyLongform">{address}</Typography>

      <div className="flex justify-center space-x-1">
        <AiOutlineCopy
          onClick={() => copy(address)}
          className="cursor-pointer"
        />
        <Link
          href={`https://etherscan.io/address/${address}`}
          rel="noreferrer noopener"
          target="_blank"
        >
          <RxExternalLink />
        </Link>
      </div>
      <br />
    </div>
  );
}
