/* eslint-disable react/jsx-no-bind, react/require-default-props */
import { Button, Typography } from "@mantle/ui";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useContext, useState, useEffect, useMemo } from "react";

import { MdClear } from "react-icons/md";
import useIsChainID from "@hooks/useIsChainID";
import StateContext from "@context/state";
import { useAccount } from "wagmi";

/**
 *
 * @todo MORE TO SEPERATE COMPONENT
 *
 */

function Values({
  label,
  value,
  border = false,
}: {
  label: string;
  value: string;
  border: boolean;
}) {
  return (
    <div className="flex flex-col my-5">
      <div className="text-type-secondary">{label}</div>
      <div className="text-xl mb-5 text-white">{value}</div>
      {border && (
        <div className="w-full" style={{ borderBottom: "1px solid #41474D" }} />
      )}
    </div>
  );
}

type CTAProps = {
  type: "Deposit" | "Withdraw";
  selectedToken: string;
  selectedTokenAmount?: string;
  destinationToken: string;
  destinationTokenAmount?: string;
};

export default function CTA({
  type,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  destinationToken,
  selectedTokenAmount = "",
  destinationTokenAmount = "",
}: CTAProps) {
  // use these to call the mantle-sdk
  // eslint-disable-next-line no-console
  // console.log(
  //   selectedToken,
  //   selectedTokenAmount,
  //   destinationToken,
  //   destinationTokenAmount
  // );

  // unpack the context
  const { chainId } = useContext(StateContext);

  // pick up connection details from wagmi
  const { address: wagmiAddress } = useAccount();

  // check that we're connected to the appropriate chain
  const isGoerliChainID = useIsChainID(5);
  const isMantleChainID = useIsChainID(5001);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>();

  const isChainID = useMemo(() => {
    return (
      (chainId === 5 && isGoerliChainID) ||
      (chainId === 5001 && isMantleChainID) ||
      !address
    );
  }, [address, chainId, isGoerliChainID, isMantleChainID]);

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // set wagmi address to address for ssr
  useEffect(() => {
    setAddress(wagmiAddress);
  }, [wagmiAddress]);

  return (
    <div className="my-4">
      <Button
        type="button"
        size="full"
        onClick={openModal}
        disabled={
          !isChainID ||
          !destinationTokenAmount ||
          !selectedTokenAmount ||
          !parseFloat(destinationTokenAmount) ||
          Number.isNaN(parseFloat(destinationTokenAmount)) ||
          Number.isNaN(parseFloat(selectedTokenAmount))
        }
      >
        {type === "Deposit"
          ? "Deposit Tokens to L2"
          : "Withdraw Tokens from L2"}
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all space-y-10">
                  <span className="flex justify-between align-middle">
                    <Typography variant="modalHeading">
                      Confirm Transaction
                    </Typography>
                    <Typography variant="modalHeading" className="text-white">
                      <MdClear
                        onClick={closeModal}
                        className="cursor-pointer"
                      />
                    </Typography>
                  </span>

                  <Values label="Amount to deposit" value="0.01 Eth" border />
                  <Values label="Time to transfer" value="5 Minutes" border />
                  <Values
                    label="Time to transfer"
                    value="5 Minutes"
                    border={false}
                  />
                  <Button size="full">Confirm</Button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <hr className="border border-stroke-inputs mt-6 mb-8" />
    </div>
  );
}
