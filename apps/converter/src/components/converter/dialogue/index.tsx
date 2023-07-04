import { useContext, useMemo } from "react";
import StateContext from "@providers/stateContext";

import {
  CONVERSION_RATE,
  CTAPages,
  L1_BITDAO_TOKEN,
  L1_MANTLE_TOKEN,
} from "@config/constants";

import Default from "@components/converter/dialogue/Default";

import Loading from "@components/converter/dialogue/Loading";
import Error from "@components/converter/dialogue/Error";

import Converted from "@components/converter/dialogue/Completed";

import { ConvertCard } from "@components/ConvertCard";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import Terms from "./Terms";

export default function Dialogue() {
  const {
    chainId,
    txHash,
    ctaPage,
    setCTAPage,
    setCTAStatus,
    setTxHash,
    setSafeChains,
    isCTAPageOpenRef: isOpenRef,
    amount,
    isCTAPageOpen,
    setIsCTAPageOpen,
  } = useContext(StateContext);

  const from = useMemo(() => {
    const formatted = formatUnits(
      parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals),
      L1_BITDAO_TOKEN.decimals
    );
    return formatted.replace(/\.0$/, "");
  }, [amount]);

  const to = useMemo(() => {
    let bn = parseUnits(amount || "0", L1_MANTLE_TOKEN.decimals);
    if (CONVERSION_RATE !== 1) {
      bn = bn.mul(CONVERSION_RATE * 100).div(100);
    }
    const formatted = formatUnits(bn, L1_MANTLE_TOKEN.decimals).toString();

    return formatted.replace(/\.0$/, "");
  }, [amount]);

  const reset = () => {
    // clear the last tx we set
    setTxHash(false);
    // clear the cta status
    setCTAStatus(false);
    // return to the default page
    setCTAPage(CTAPages.Default);
    // restore safeChains to selected chain
    setSafeChains([chainId]);
  };

  const closeModalAndReset = () => {
    // manually set this ref
    isOpenRef.current = false;
    // exit the modal
    setIsCTAPageOpen(false);
    // after timeout to prevent flash of the first screen on close
    setTimeout(() => {
      // reset local state
      reset();
    }, 201); // using ease-in duration-200 for animation
  };

  return (
    (isCTAPageOpen && (
      <ConvertCard>
        <div className="w-full max-w-lg transform text-left align-middle transition-all space-y-10 px-4 py-6">
          {ctaPage === CTAPages.Default && (
            <Default closeModal={closeModalAndReset} />
          )}
          {ctaPage === CTAPages.Converted && (
            <Converted
              txHash={txHash}
              from={from}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Loading && (
            <Loading
              txHash={txHash}
              closeModal={closeModalAndReset}
              from={from}
              to={to}
            />
          )}
          {ctaPage === CTAPages.Error && (
            <Error reset={reset} closeModal={closeModalAndReset} />
          )}
          {ctaPage === CTAPages.Terms && <Terms />}
        </div>
      </ConvertCard>
    )) || <div />
  );
}
