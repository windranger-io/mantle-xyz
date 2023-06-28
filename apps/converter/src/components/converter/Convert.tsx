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
import { SmartContractTracker } from "./SmartContractTracker";

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
          <div className="relative w-full lg:min-w-[484px] lg:w-[484px] flex flex-col md:flex-row lg:block gap-4 lg:mx-auto ">
            <ConvertCard>
              <From />
              <Hr />
              <To />
              <div className="px-5 pb-4">
                <CTA setIsOpen={setIsCTAPageOpen} />
                <TX />
              </div>
            </ConvertCard>
            <div className="flex flex-col w-full md:w-[80%] lg:w-auto lg:min-w-[250px] xl:min-w-[320px] lg:absolute lg:top-0 lg:right-[-60%] xl:right-[-80%]">
              <SmartContractTracker />
            </div>
          </div>
        </>
      ))) || <span />
  );
}
