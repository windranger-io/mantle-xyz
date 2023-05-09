/* eslint-disable react/require-default-props */
import { CHAINS, MANTLE_TOKEN_LIST } from "@config/constants";
import Image from "next/image";
import DirectionLabel from "./DirectionLabel";

type DestinationProps = {
  type: string;
  destinationToken: string;
  destinationTokenAmount?: string;
};

export default function Destination({
  type,
  destinationToken,
  destinationTokenAmount = "",
}: DestinationProps) {
  const msg = `You will recieve ${
    Number.isNaN(parseFloat(destinationTokenAmount))
      ? 0
      : destinationTokenAmount || 0
  } ${destinationToken} token${(destinationTokenAmount !== "1" && "s") || ""}`;

  return (
    <div>
      <DirectionLabel
        direction="To"
        logo={
          <Image
            alt={`Logo for ${destinationToken}`}
            src={
              MANTLE_TOKEN_LIST.tokens.find((token) => {
                return token.name === destinationToken;
              })?.logoURI!
            }
            width={16}
            height={16}
          />
        }
        chain={`${destinationToken} (on ${
          type === "Deposit" ? CHAINS[5001].chainName : CHAINS[5].chainName
        })`}
      />
      <input
        className="w-full border border-stroke-inputs rounded-lg bg-black py-1.5 px-3 "
        disabled
        value={
          (destinationTokenAmount &&
            parseFloat(destinationTokenAmount) &&
            msg) ||
          ""
        }
        placeholder={
          !destinationTokenAmount || !parseFloat(destinationTokenAmount)
            ? msg
            : "0"
        }
      />
    </div>
  );
}
