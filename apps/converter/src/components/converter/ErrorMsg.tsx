import { useContext, useEffect } from "react";
import { Typography } from "@mantle/ui";

import StateContext from "@providers/stateContext";

enum ErrorMessages {
  INSUFFICIENT_GAS = "You do not have enough gas to cover the transaction cost.",
  HALTED = "Conversion halted. Contract is under maintenance. Please check later.",
}

export default function ErrorMsg({ halted }: { halted: boolean }) {
  const { errorMsg, setErrorMsg } = useContext(StateContext);

  useEffect(() => {
    if (halted) {
      setErrorMsg(ErrorMessages.HALTED);
    } else {
      setErrorMsg("");
    }
  }, [halted]);

  if (errorMsg) {
    return (
      <Typography variant="smallWidget" className="mt-4 mb-2 text-[#E22F3D]">
        {errorMsg}
      </Typography>
    );
  }

  return null;
}
