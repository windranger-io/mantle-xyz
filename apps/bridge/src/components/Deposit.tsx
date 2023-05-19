import { Direction, Token } from "@config/constants";

// by order of use...
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
  const direction = Direction.Deposit;

  return (
    <div>
      <TokenSelect selected={selected} direction={direction} />
      <Divider />
      <Destination direction={direction} />
      <CTA direction={direction} setIsOpen={setIsOpen} selected={selected} />
      <TransactionPanel
        selected={selected}
        destination={destination}
        direction={direction}
      />
    </div>
  );
}
