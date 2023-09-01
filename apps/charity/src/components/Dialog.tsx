"use client";

import { Dispatch, SetStateAction } from "react";
import { useWaitForTransaction } from "wagmi";
import Image from "next/image";
import { Dialog } from "@headlessui/react";

import { Typography } from "@mantle/ui";
import { L1_CHAIN_ID, L1_NFT_ADDRESS } from "@config/constants";
import TxLink from "@components/TxLink";
import { useTotalMinted } from "@hooks/web3/read";

export default function TxDialog({
  txHash,
  isOpen,
  setIsOpen,
  numOfToken,
  resetUserClaimedAmount,
}: {
  txHash: `0x${string}`;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  numOfToken: number;
  resetUserClaimedAmount: () => void;
}) {
  const { resetTotalMinted } = useTotalMinted(L1_NFT_ADDRESS);

  const { isLoading: isTxLoading } = useWaitForTransaction({
    hash: txHash,
    onSuccess() {
      resetTotalMinted();
      resetUserClaimedAmount();
    },
  });

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!isTxLoading) {
          setIsOpen(false);
        }
      }}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-lg"
        aria-hidden="true"
      />
      {/* Full-screen scrollable container */}
      <div className="fixed inset-0 overflow-y-auto p-4">
        {/* Container to center the panel */}
        <div className="flex min-h-full items-center justify-center">
          {/* The actual dialog panel  */}
          <Dialog.Panel className="relative flex flex-col items-start lg:min-w-[484px] mx-auto rounded-[14px] bg-black px-4 py-8">
            <div className="w-full px-5">
              {!isTxLoading && (
                <button
                  type="button"
                  className="absolute right-10 top-10"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.5 14.1L1.9 24.75C1.66667 24.95 1.4 25.05 1.1 25.05C0.8 25.05 0.533334 24.95 0.3 24.75C0.1 24.5167 0 24.25 0 23.95C0 23.65 0.1 23.3833 0.3 23.15L10.95 12.5L0.35 1.9C0.116667 1.7 0 1.45 0 1.15C0 0.850001 0.1 0.583334 0.3 0.35C0.533334 0.116667 0.8 0 1.1 0C1.4 0 1.66667 0.116667 1.9 0.35L12.5 11L23.1 0.35C23.3333 0.15 23.6 0.0500002 23.9 0.0500002C24.2 0.0500002 24.4667 0.15 24.7 0.35C24.9 0.583334 25 0.850001 25 1.15C25 1.45 24.9 1.71667 24.7 1.95L14.05 12.55L24.7 23.2C24.9 23.4 25 23.65 25 23.95C25 24.25 24.9 24.5 24.7 24.7C24.4667 24.9333 24.2083 25.05 23.925 25.05C23.6417 25.05 23.3833 24.9333 23.15 24.7L12.5 14.1Z"
                      fill="white"
                    />
                  </svg>
                </button>
              )}
              <Typography
                variant="h6TitleMini"
                className="text-center my-2.5 grow"
              >
                {isTxLoading ? "Minting request pending" : "Minting complete"}
              </Typography>

              <div className="flex items-center justify-center py-12">
                {isTxLoading ? (
                  <Image
                    src="/preloader_animation_160.gif"
                    width="80"
                    height="80"
                    alt="Mantle loading wheel"
                  />
                ) : (
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_2300_7133"
                      style={{ maskType: "alpha" }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="80"
                      height="80"
                    >
                      <rect width="80" height="80" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_2300_7133)">
                      <path
                        d="M35.1257 47.6249L26.9959 39.4535C26.4991 38.9844 25.9034 38.7499 25.209 38.7499C24.5145 38.7499 23.9034 39.0138 23.3757 39.5416C22.8757 40.0416 22.6257 40.6388 22.6257 41.3333C22.6257 42.0277 22.8708 42.6061 23.361 43.0686L33.459 53.2499C33.9211 53.7499 34.4754 53.9999 35.1219 53.9999C35.7683 53.9999 36.339 53.7499 36.834 53.2499L56.584 33.4999C57.1118 32.9721 57.3757 32.361 57.3757 31.6666C57.3757 30.9721 57.1118 30.3471 56.584 29.7916C56.0284 29.3194 55.3895 29.0971 54.6673 29.1249C53.9451 29.1527 53.3515 29.399 52.8867 29.8639L35.1257 47.6249ZM40.006 72.9166C35.5076 72.9166 31.254 72.0482 27.2452 70.3113C23.2364 68.5745 19.742 66.2134 16.7622 63.228C13.7823 60.2426 11.4243 56.7493 9.68815 52.748C7.95204 48.7467 7.08398 44.4991 7.08398 40.0053C7.08398 35.4513 7.9524 31.1699 9.68923 27.1612C11.4261 23.1523 13.7872 19.6649 16.7726 16.6989C19.758 13.7329 23.2513 11.3888 27.2526 9.66659C31.2538 7.94436 35.5014 7.08325 39.9953 7.08325C44.5493 7.08325 48.8308 7.94803 52.8399 9.67759C56.8491 11.4071 60.3365 13.7543 63.3022 16.7193C66.2678 19.6841 68.6118 23.1672 70.334 27.1685C72.0562 31.1698 72.9173 35.4451 72.9173 39.9946C72.9173 44.4929 72.0559 48.7465 70.3329 52.7553C68.61 56.7642 66.2627 60.2585 63.2912 63.2384C60.3197 66.2183 56.8333 68.5763 52.8321 70.3124C48.8308 72.0485 44.5554 72.9166 40.006 72.9166ZM39.9979 68.1249C47.8053 68.1249 54.4451 65.3758 59.9173 59.8777C65.3895 54.3795 68.1257 47.7545 68.1257 40.0027C68.1257 32.1953 65.3905 25.5555 59.9201 20.0833C54.4497 14.611 47.8108 11.8749 40.0034 11.8749C32.2516 11.8749 25.6257 14.6101 20.1257 20.0805C14.6257 25.5509 11.8757 32.1898 11.8757 39.9972C11.8757 47.749 14.6247 54.3749 20.1229 59.8749C25.6211 65.3749 32.2461 68.1249 39.9979 68.1249Z"
                        fill="#3EB66A"
                      />
                    </g>
                  </svg>
                )}
              </div>
              {!isTxLoading && (
                <div className="text-center text-lg max-w-[484px]">
                  <div className="mb-4">
                    {`You have minted ${numOfToken} NFT(s) of the collection, please check Etherscan for the NFT ID # and details`}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-4">
                <TxLink chainId={L1_CHAIN_ID} txHash={txHash} />
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
