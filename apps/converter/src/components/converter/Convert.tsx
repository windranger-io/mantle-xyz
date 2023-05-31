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

import { SimpleCard } from "@mantle/ui";

export default function Convert() {
  // unpack the context
  const { view, isCTAPageOpen, setIsCTAPageOpen } = useContext(StateContext);

  return (
    (view === Views.Default &&
      ((isCTAPageOpen && (
        <Dialogue isOpen={isCTAPageOpen} setIsOpen={setIsCTAPageOpen} />
      )) || (
        <SimpleCard className="max-w-lg w-full grid gap-4 relative bg-[#0D0D0D] overflow-auto md:overflow-hidden">
          <From />
          <Hr />
          <To />
          <CTA setIsOpen={setIsCTAPageOpen} />
          <TX />
        </SimpleCard>
      ))) || <span />
  );
}
