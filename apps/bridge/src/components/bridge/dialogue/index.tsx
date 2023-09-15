import { useContext } from "react";

import StateContext from "@providers/stateContext";

import { Direction, CTAPages, Token } from "@config/constants";

import Default from "@components/bridge/dialogue/Default";

import Loading from "@components/bridge/dialogue/Loading";
import Error from "@components/bridge/dialogue/Error";

import Deposited from "@components/bridge/dialogue/Deposited";
import Withdraw from "@components/bridge/dialogue/Withdraw";
import Withdrawn from "@components/bridge/dialogue/Withdrawn";
import WhatsNext from "@components/bridge/dialogue/WhatsNext";

import { SimpleCard } from "@mantle/ui";

export default function Dialogue({
  direction,
  selected,
  destination,
  isOpen,
  setIsOpen,
}: {
  direction: Direction;

  selected: Token;
  destination: Token;

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const {
    chainId,
    tx1,
    tx1Hash,
    tx2Hash,
    ctaPage,
    ctaStatus,
    setCTAPage,
    setCTAStatus,
    setTx1Hash,
    setTx2Hash,
    setSafeChains,
    isCTAPageOpenRef: isOpenRef,
    setSelectedTokenAmount,
  } = useContext(StateContext);

  const reset = () => {
    // clear the last tx we set
    setTx1Hash(false);
    setTx2Hash(false);
    // clear the cta status
    setCTAStatus(false);
    // return to the default page
    setCTAPage(CTAPages.Default);
    // restore safeChains to selected chain
    setSafeChains([chainId]);
    // reset selected token amount
    if (ctaPage !== CTAPages.Default) {
      setSelectedTokenAmount("");
    }
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
      <SimpleCard className="max-w-lg w-full grid gap-4 relative bg-black border border-stroke-primary">
        <div className="w-full max-w-lg transform px-6 text-left align-middle transition-all space-y-10">
          {ctaPage === CTAPages.Default && (
            <Default
              direction={direction}
              selected={selected}
              destination={destination}
              ctaStatus={ctaStatus}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Deposit && (
            <Deposited
              tx1Hash={tx1Hash}
              tx2Hash={tx2Hash}
              direction={direction}
            />
          )}
          {ctaPage === CTAPages.Deposited && (
            <WhatsNext closeModal={closeModalAndReset} />
          )}
          {ctaPage === CTAPages.Withdraw && (
            <Withdraw
              tx1={tx1}
              tx1Hash={tx1Hash}
              tx2Hash={tx2Hash}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Withdrawn && (
            <Withdrawn
              tx1Hash={tx1Hash}
              tx2Hash={tx2Hash}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Loading && (
            <Loading
              tx1Hash={tx1Hash}
              tx2Hash={tx2Hash}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Error && (
            <Error reset={reset} closeModal={closeModalAndReset} />
          )}
        </div>
      </SimpleCard>
    )) || <div />
  );
}
