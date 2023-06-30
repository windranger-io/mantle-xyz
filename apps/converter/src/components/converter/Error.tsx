import { useEffect, useState } from "react";
import { Typography } from "@mantle/ui";

enum ErrorMessages {
  INSUFFICIENT_GAS = "You do not have enough gas to cover the transaction cost.",
  HALTED = "Conversion halted. Contract is under maintenance. Please check later.",
}

export default function ErrorMsg({ halted }: { halted: boolean }) {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (halted) {
      setError(ErrorMessages.HALTED);
    } else {
      setError("");
    }
  }, [halted]);

  if (error) {
    return (
      <Typography variant="smallWidget" className="mt-4 mb-2 text-[#E22F3D]">
        {error}
      </Typography>
    );
  }

  return null;
}
