import {
  L1_BITDAO_TOKEN,
  L1_CHAIN_ID,
  L1_MANTLE_TOKEN,
} from "@config/constants";

import StateContext from "@providers/stateContext";
import Image from "next/image";
import { useContext, useEffect } from "react";

import Values from "@components/converter/utils/Values";
import { useCallApprove } from "@hooks/web3/converter/write/useCallApprove";
import { Button, Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";

export default function Default({ closeModal }: { closeModal: () => void }) {
  const { amount, setCTAChainId } = useContext(StateContext);
  const { approve, approvalStatus } = useCallApprove();

  // set the chainId onload
  useEffect(
    () => {
      setCTAChainId(L1_CHAIN_ID);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading">
          Confirm migration request
        </Typography>
        <Typography variant="modalHeading" className="text-white pt-1">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <div>
        <Values
          label="Amount to migrate"
          value={
            <div className="flex items-center space-x-2">
              <span>
                {amount} ${L1_BITDAO_TOKEN.symbol}
              </span>
              <Image
                alt={`Logo for ${L1_BITDAO_TOKEN?.name}`}
                src={L1_BITDAO_TOKEN?.logoURI}
                width={24}
                height={24}
              />
            </div>
          }
          border
        />
        <Values
          label="You will receive"
          value={
            <div className="flex items-center space-x-2">
              <span>
                {amount} ${L1_MANTLE_TOKEN.symbol}
              </span>
              <Image
                alt={`Logo for ${L1_MANTLE_TOKEN?.name}`}
                src={L1_MANTLE_TOKEN?.logoURI}
                width={24}
                height={24}
                className="pb-px"
              />
            </div>
          }
          border
        />
        {/* <Values label="Time to migrate" value="~5 minutes" border /> */}
        <Typography variant="smallWidget" className="mb-6">
          Approve the Spender (Migrator v2) with the exact amount of $BIT you
          request to migrate. It may take up to 24 hours to complete qualified
          migrations as per terms of{" "}
          <a
            href="https://snapshot.org/#/bitdao.eth/proposal/0x00625c4f2d9aa9d4efb41ef3d0942194ca2087fae0599deced8b8ed86372c6c2"
            target="__blank"
            rel="noreferrer"
            className="underline"
          >
            MIP-27
          </a>
          .
        </Typography>
        <Button
          size="full"
          disabled={!!approvalStatus}
          onClick={() => approve()}
        >
          {!approvalStatus ? (
            "Confirm"
          ) : (
            <div className="flex flex-row gap-4 items-center mx-auto w-fit">
              <span>Confirm with your wallet now.</span>
              {approvalStatus ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                ""
              )}
            </div>
          )}
        </Button>
        {/* {!ctaStatus && (
          <Button
            size="full"
            variant="secondary"
            className="mt-4"
            onClick={closeModal}
          >
            Back
          </Button>
        )} */}
      </div>
    </>
  );
}
