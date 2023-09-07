"use client";

import {
  L1_CONVERTER_V2_CONTRACT_ABI,
  L1_CONVERTER_V2_CONTRACT_ADDRESS,
  Views,
} from "@config/constants";
import StateContext from "@providers/stateContext";
import { Contract } from "ethers";
import { Suspense, useContext, useEffect, useState } from "react";

// by order of use...
import { ConvertCard } from "@components/ConvertCard";
import CTA from "@components/converter/CTA";
import Hr from "@components/converter/Divider";
import ErrorMsg from "@components/converter/ErrorMsg";
import From from "@components/converter/From";
import To from "@components/converter/To";
import TX from "@components/converter/TransactionPanel";
import Dialogue from "@components/converter/dialogue";
import { Typography } from "@mantle/ui";
import { Faq } from "./Faq";
import { SmartContractTracker } from "./SmartContractTracker";
import { Loading as SCLoading } from "./SmartContractTracker/Loading";

export default function Convert() {
  // unpack the context
  const { provider, view, isCTAPageOpen, setIsCTAPageOpen } =
    useContext(StateContext);

  const [halted, setHalted] = useState<boolean>(true);

  useEffect(() => {
    // read halted from contract
    const getHaltedStatus = async () => {
      const contract = new Contract(
        L1_CONVERTER_V2_CONTRACT_ADDRESS,
        L1_CONVERTER_V2_CONTRACT_ABI,
        provider
      );
      const status = await contract.halted();
      setHalted(status);
    };
    getHaltedStatus();
  }, [provider]);

  if (view !== Views.Default) {
    return <span />;
  }

  if (isCTAPageOpen) {
    return <Dialogue />;
  }

  return (
    <div className="md:px-8 w-full">
      <Typography variant="appPageHeading" className="text-center text-[42px]">
        Migrator v2
      </Typography>
      <Typography variant="body" className="text-center mt-6 mb-2">
        Request $BIT migration to $MNT, see{" "}
        <a
          href="https://www.mantle.xyz/blog"
          target="__blank"
          rel="noreferrer"
          className="underline"
        >
          blogpost
        </a>{" "}
        for how it works
      </Typography>
      <div className="lg:relative lg:w-[484px] flex flex-col md:flex-row md:justify-center md:items-start md:gap-5 gap-4 lg:mx-auto ">
        <ConvertCard className="min-w-[320px]">
          <From />
          <Hr />
          <To />
          <div className="px-5 pb-4">
            <CTA setIsOpen={setIsCTAPageOpen} halted={!!halted} />
            <ErrorMsg halted={!!halted} />
            <TX />
          </div>
        </ConvertCard>
        <div className="flex flex-col xl:w-[280px] lg:w-[240px] md:max-w-[328px] md:min-w-[250px] lg:absolute lg:top-0 lg:-right-[260px] xl:-right-[396px] w-auto">
          <Suspense fallback={<SCLoading />}>
            <SmartContractTracker halted={!!halted} />
          </Suspense>
          <Faq />
        </div>
      </div>
    </div>
  );
}
