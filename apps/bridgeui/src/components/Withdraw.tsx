import { useState } from "react";
import Destination from "./Destination";
import Divider from "./Divider";
import TokenSelect from "./TokenSelect";
import TransactionPanel from "./TransactionPanel";
import CTA from "./CTA";

export default function Withdraw() {
  const type = "Withdraw";

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
