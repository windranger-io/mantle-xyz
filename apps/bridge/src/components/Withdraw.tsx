import { Direction, Token } from "@config/constants";

// in order of use...
import TokenSelect from "@components/TokenSelect";
import Divider from "@components/Divider";
import Destination from "@components/Destination";
import CTA from "@components/CTA";
import TransactionPanel from "@components/TransactionPanel";

export default function Withdraw({
  selected,
  destination,
  setIsOpen,
}: {
  selected: Token;
  destination: Token;
  setIsOpen: (v: boolean) => void;
}) {
  const direction = Direction.Withdraw;

  return (
    <div>
      <TokenSelect selected={selected} direction={direction} />
      <Divider />
      <Destination direction={direction} />
      <CTA direction={direction} selected={selected} setIsOpen={setIsOpen} />
      <TransactionPanel
        selected={selected}
        destination={destination}
        direction={direction}
      />
    </div>
  );
}
