"use client";

import {
  Views,
  L1_CONVERTER_CONTRACT_ABI,
  L1_CONVERTER_CONTRACT_ADDRESS,
} from "@config/constants";
import StateContext from "@providers/stateContext";
import { Suspense, useContext } from "react";
import { useContractRead } from "wagmi";

// by order of use...
import Dialogue from "@components/converter/dialogue";
import From from "@components/converter/From";
import Hr from "@components/converter/Divider";
import To from "@components/converter/To";
import CTA from "@components/converter/CTA";
import ErrorMsg from "@components/converter/ErrorMsg";
import TX from "@components/converter/TransactionPanel";
import { Typography } from "@mantle/ui";
import { ConvertCard } from "@components/ConvertCard";
import { SmartContractTracker } from "./SmartContractTracker";
import { Loading as SCLoading } from "./SmartContractTracker/Loading";
import { Faq } from "./Faq";

export default function Convert() {
  // unpack the context
  const { view, isCTAPageOpen, setIsCTAPageOpen } = useContext(StateContext);

  const { data: halted } = useContractRead({
    address: L1_CONVERTER_CONTRACT_ADDRESS,
    abi: L1_CONVERTER_CONTRACT_ABI,
    watch: true,
    functionName: "halted",
  });

  if (view !== Views.Default) {
    return <span />;
  }

  if (isCTAPageOpen) {
    return <Dialogue />;
  }

  return (
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
            <CTA setIsOpen={setIsCTAPageOpen} halted={!!halted} />
            <ErrorMsg halted={!!halted} />
            <TX />
          </div>
        </ConvertCard>
        <div className="flex flex-col w-full md:w-[80%] lg:w-auto lg:min-w-[250px] lg:max-w-[250px] xl:w-[320px] xl:max-w-[320px] lg:absolute lg:top-0 lg:right-[-55%] xl:right-[-80%]">
          <Suspense fallback={<SCLoading />}>
            <SmartContractTracker halted={!!halted} />
          </Suspense>
          <Faq />
        </div>
      </div>
    </>
  );
}
