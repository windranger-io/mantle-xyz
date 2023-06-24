"use client";

import { Views } from "@config/constants";
import StateContext from "@providers/stateContext";
import { useContext } from "react";

// by order of use...
import Dialogue from "@components/converter/dialogue";
import From from "@components/converter/From";
import Hr from "@components/converter/Divider";
import To from "@components/converter/To";
import CTA from "@components/converter/CTA";
import TX from "@components/converter/TransactionPanel";
import { Typography } from "@mantle/ui";
import { ConvertCard } from "@components/ConvertCard";

export default function Convert() {
  // unpack the context
  const { view, isCTAPageOpen, setIsCTAPageOpen } = useContext(StateContext);

  return (
    (view === Views.Default &&
      ((isCTAPageOpen && (
        <>
          <Typography
            variant="appPageHeading"
            className="text-center mt-4 text-[42px] mb-[52px]"
          >
            Welcome to the Converter
          </Typography>
          <Dialogue isOpen={isCTAPageOpen} setIsOpen={setIsCTAPageOpen} />
        </>
      )) || (
        <>
          <Typography
            variant="appPageHeading"
            className="text-center mt-4 text-[42px]"
          >
            Converter
          </Typography>
          <Typography variant="body" className="text-center mt-6 mb-2">
            Convert tokens. Conversion is irreversible.
          </Typography>
          <ConvertCard>
            <From />
            <Hr />
            <To />
            <div className="px-5">
              <CTA setIsOpen={setIsCTAPageOpen} />
              <TX />
              <Typography variant="body" className="text-center mt-6 mb-2">
                We will refund gas fee
              </Typography>
            </div>
          </ConvertCard>
        </>
      ))) || <span />
  );
}
