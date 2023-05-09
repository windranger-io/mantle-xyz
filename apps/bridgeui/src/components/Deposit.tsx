import { useState } from "react";
import CTA from "./CTA";
import Destination from "./Destination";
import Divider from "./Divider";
import TokenSelect from "./TokenSelect";
import TransactionPanel from "./TransactionPanel";

export default function Deposit() {
  const type = "Deposit";

  const [selectedToken, setSelectedToken] = useState<string>("BitDAO");
  const [destinationToken, setDestinationToken] = useState<string>("BitDAO");

  const [selectedTokenAmount, setSelectedTokenAmount] = useState<string>();
  const [destinationTokenAmount, setDestinationTokenAmount] =
    useState<string>();

  return (
    <div>
      <TokenSelect
        type={type}
        selectedToken={selectedToken}
        selectedTokenAmount={selectedTokenAmount}
        setSelectedToken={setSelectedToken}
        setSelectedTokenAmount={setSelectedTokenAmount}
        setDestinationToken={setDestinationToken}
        setDestinationTokenAmount={setDestinationTokenAmount}
      />
      <Divider />
      <Destination
        type={type}
        destinationToken={destinationToken}
        destinationTokenAmount={destinationTokenAmount}
      />
      <CTA
        type={type}
        selectedToken={selectedToken}
        destinationToken={destinationToken}
        selectedTokenAmount={selectedTokenAmount}
        destinationTokenAmount={destinationTokenAmount}
      />
      <TransactionPanel />
    </div>
  );
}
