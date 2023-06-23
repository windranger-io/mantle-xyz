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

export default function Convert() {
  // unpack the context
  const { view, isCTAPageOpen, setIsCTAPageOpen } = useContext(StateContext);

  return (
    (view === Views.Default &&
      ((isCTAPageOpen && (
        <Dialogue isOpen={isCTAPageOpen} setIsOpen={setIsCTAPageOpen} />
      )) || (
        <div className="max-w-lg w-full grid gap-4 relative bg-[#000000] overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-t-[30px] rounded-b-[20px] py-6 mx-auto">
          <From />
          <Hr />
          <To />
          <div className="px-5">
            <CTA setIsOpen={setIsCTAPageOpen} />
            <TX />
          </div>
        </div>
      ))) || <span />
  );
}
