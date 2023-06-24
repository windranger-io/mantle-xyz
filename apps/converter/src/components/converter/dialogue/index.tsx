import { useContext } from "react";

import StateContext from "@providers/stateContext";

import { CTAPages } from "@config/constants";

import Default from "@components/converter/dialogue/Default";

import Loading from "@components/converter/dialogue/Loading";
import Error from "@components/converter/dialogue/Error";

import Converted from "@components/converter/dialogue/Converted";

import { ConvertCard } from "@components/ConvertCard";
import Terms from "./Terms";

export default function Dialogue({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const {
    chainId,
    txHash,
    ctaPage,
    setCTAPage,
    setCTAStatus,
    setTxHash,
    setSafeChains,
    isCTAPageOpenRef: isOpenRef,
  } = useContext(StateContext);

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
    setIsOpen(false);
    // after timeout to prevent flash of the first screen on close
    setTimeout(() => {
      // reset local state
      reset();
    }, 201); // using ease-in duration-200 for animation
  };

  return (
    (isOpen && (
      <ConvertCard>
        <div className="w-full max-w-lg transform text-left align-middle transition-all space-y-10 px-4 py-6">
          {ctaPage === CTAPages.Default && (
            <Default closeModal={closeModalAndReset} />
          )}
          {ctaPage === CTAPages.Converted && (
            <Converted txHash={txHash} closeModal={closeModalAndReset} />
          )}
          {ctaPage === CTAPages.Loading && (
            <Loading txHash={txHash} closeModal={closeModalAndReset} />
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
