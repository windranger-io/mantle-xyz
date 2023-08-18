import { useContext, useEffect } from "react";
import { Typography } from "@mantle/ui";

import StateContext from "@providers/stateContext";
import { ErrorMessages, migrationPolicyUrl } from "@config/constants";

export default function ErrorMsg({ halted }: { halted: boolean }) {
  const { errorMsg, setErrorMsg } = useContext(StateContext);

  useEffect(() => {
    if (halted) {
      setErrorMsg(ErrorMessages.HALTED);
    } else if (errorMsg === ErrorMessages.HALTED) {
      // don't remove error msg if it is other existing error
      setErrorMsg("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [halted]);

  if (errorMsg) {
    return (
      <Typography variant="smallWidget" className="mt-4 mb-2 text-[#E22F3D]">
        {errorMsg}
        {errorMsg === ErrorMessages.HALTED && (
          <>
            <a
              href={migrationPolicyUrl}
              target="__blank"
              rel="noreferrer"
              className="underline text-md"
            >
              here
            </a>
            .
          </>
        )}
      </Typography>
    );
  }

  return null;
}
