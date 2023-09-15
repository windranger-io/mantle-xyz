import Image from "next/image";
import { useContext, useMemo } from "react";

import { Button } from "@mantle/ui";

import StateContext from "@providers/stateContext";
import { Direction } from "@config/constants";
import { useAddToken } from "@hooks/web3/write/useAddToken";

import MetamaskSvg from "public/deposited/metamask.svg";

export default function ImportTokenBtn({
  direction,
}: {
  direction: Direction;
}) {
  const { addToken } = useAddToken();

  const { destinationToken, tokenList } = useContext(StateContext);

  // fetch the full destination token from name
  const destination = useMemo(
    () => tokenList?.tokens.find((v) => destinationToken[direction] === v.name),
    [destinationToken, tokenList]
  );

  if (!destination) return null;

  return (
    <Button
      type="button"
      size="full"
      className="h-14 flex flex-row gap-4 text-center items-center justify-center my-4"
      onClick={() => addToken(destination)}
    >
      <Image src={MetamaskSvg} alt="metamask" height={26} width={26} />
      {`Import ${destination.symbol} on Mantle Network`}
    </Button>
  );
}
