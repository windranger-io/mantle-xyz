import { useContext } from "react";

import StateContext from "@providers/stateContext";

import { Direction, CTAPages, Token } from "@config/constants";

import CTAPageDefault from "@components/CTAPageDefault";
import CTAPageDeposited from "@components/CTAPageDeposited";
import CTAPageLoading from "@components/CTAPageLoading";
import CTAPageWithdrawn from "@components/CTAPageWithdrawn";
import CTAPageError from "@components/CTAPageError";
import CTAPageWithdraw from "@components/CTAPageWithdraw";

import { SimpleCard } from "@mantle/ui";

export default function CTAPage({
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
    l1Tx,
    l1TxHash,
    l2TxHash,
    ctaPage,
    ctaStatus,
    setCTAPage,
    setCTAStatus,
    setL1TxHash,
    setL2TxHash,
    setSafeChains,
    isCTAPageOpenRef: isOpenRef,
  } = useContext(StateContext);

  const reset = () => {
    // clear the last tx we set
    setL1TxHash(false);
    setL2TxHash(false);
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
      <SimpleCard className="max-w-lg w-full grid gap-4 relative bg-black border border-stroke-primary">
        <div className="w-full max-w-lg transform px-6 text-left align-middle transition-all space-y-10">
          {ctaPage === CTAPages.Default && (
            <CTAPageDefault
              direction={direction}
              selected={selected}
              destination={destination}
              ctaStatus={ctaStatus}
              setCTAStatus={(v: string | boolean) => {
                // eslint-disable-next-line no-console
                if (v) console.log(v);
                // store the status - this can control the state of the loading wheel on the CTA page button (but is mostly informative)
                setCTAStatus(v);
              }}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Deposit && (
            <CTAPageDeposited
              l1TxHash={l1TxHash}
              l2TxHash={l2TxHash}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Withdraw && (
            <CTAPageWithdraw
              l1Tx={l1Tx}
              l1TxHash={l1TxHash}
              l2TxHash={l2TxHash}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Withdrawn && (
            <CTAPageWithdrawn
              l1TxHash={l1TxHash}
              l2TxHash={l2TxHash}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Loading && (
            <CTAPageLoading
              l1TxHash={l1TxHash}
              l2TxHash={l2TxHash}
              closeModal={closeModalAndReset}
            />
          )}
          {ctaPage === CTAPages.Error && (
            <CTAPageError reset={reset} closeModal={closeModalAndReset} />
          )}
        </div>
      </SimpleCard>
    )) || <div />
  );
}
