import { useContext } from "react";
import StateContext from "@providers/stateContext";

import { Button, Typography } from "@mantle/ui";

import { CTAPages } from "@config/constants";

export default function Terms() {
  const { setCTAPage, setIsCTAPageOpen } = useContext(StateContext);

  return (
    <>
      <Typography variant="modalHeadingSm" className="w-full">
        Terms
      </Typography>
      <Typography>
        Just a heads up, once converted, the process cannot be reversed - MNT
        tokens can&apos;t be reverted back to BIT tokens.
      </Typography>
      <Button
        size="full"
        onClick={() => {
          setIsCTAPageOpen(false);
          setCTAPage(CTAPages.Default);
        }}
      >
        By clicking this button you accept our terms
      </Button>
      <Typography className="text-center">
        Terms:{" "}
        <a href="https://www.mantle.xyz/terms" className="hover:underline">
          https://www.mantle.xyz/terms
        </a>
      </Typography>
    </>
  );
}
