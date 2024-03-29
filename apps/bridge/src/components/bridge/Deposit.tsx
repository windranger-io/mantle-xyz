import { Direction, Token } from "@config/constants";

// by order of use...
import TokenSelect from "@components/bridge/TokenSelect";
import Divider from "@components/bridge/Divider";
import Destination from "@components/bridge/Destination";
import CTA from "@components/bridge/CTA";
import TransactionPanel from "@components/bridge/TransactionPanel";

export default function Deposit({
  selected,
  destination,
  setIsOpen,
}: {
  selected: Token;
  destination: Token;
  setIsOpen: (v: boolean) => void;
}) {
  const direction = Direction.Deposit;

  return (
    <div>
      <TokenSelect selected={selected} direction={direction} />
      <Divider />
      <Destination direction={direction} destination={destination} />
      <CTA direction={direction} setIsOpen={setIsOpen} selected={selected} />
      <TransactionPanel
        selected={selected}
        // destination={destination}
        direction={direction}
      />
    </div>
  );
}
