import { L1_CHAIN_ID, L1_BITDAO_TOKEN } from "@config/constants";

import { useContext, useEffect, useMemo, useState } from "react";
import StateContext from "@providers/stateContext";

import { useCallConvert } from "@hooks/web3/converter/write/useCallConvert";

import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { constants } from "ethers";

import { Button, Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";
import Values from "@components/converter/utils/Values";

export default function Default({ closeModal }: { closeModal: () => void }) {
  const { ctaStatus, amount, actualGasFee, setCTAChainId } =
    useContext(StateContext);

  // only update on allowance change to maintain the correct decimals against constants if infinity
  const isActualGasFeeInfinity = useMemo(
    () => {
      return constants.MaxUint256.eq(parseUnits(actualGasFee || "0", "gwei"));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actualGasFee]
  );

  // checkboxs need to be selected to continue
  const [chkbx1, setChkbx1] = useState(false);
  const [chkbx2, setChkbx2] = useState(false);

  // use the callCTA method...
  const callCTA = useCallConvert();

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
        <Typography variant="modalHeading">Confirm Conversion</Typography>
        <Typography variant="modalHeading" className="text-white pt-1">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <div>
        <Values
          label="Amount to convert"
          value={`${amount} ${L1_BITDAO_TOKEN.symbol}`}
          border
        />
        <Values label="Time to convert" value="~5 minutes" border />
        <Values
          label="Expected gas fee"
          value={`${
            isActualGasFeeInfinity
              ? Infinity.toLocaleString()
              : formatUnits(parseUnits(actualGasFee, "gwei"), 18)
          } ETH`}
          border={false}
        />
        <div className="flex flex-row items-start gap-2 cursor-pointer my-4">
          <input
            id="checkbox-understand-1"
            type="checkbox"
            checked={chkbx1}
            onChange={(e) => {
              setChkbx1(e.currentTarget.checked);
            }}
            value=""
            className="w-4 h-4 m-[0.25rem] rounded focus:ring-blue-500/30 focus:ring-2 focus:ring-offset-gray-800 bg-gray-700 border-gray-600"
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="checkbox-understand-1"
            className="ml-2 text-sm font-medium text-gray-300"
          >
            I confirm I understand the implications of BIP-21 and that this is a
            one-way conversion.
          </label>
        </div>

        <div className="flex flex-row items-start gap-2 cursor-pointer my-4">
          <input
            id="checkbox-understand-2"
            type="checkbox"
            checked={chkbx2}
            onChange={(e) => {
              setChkbx2(e.currentTarget.checked);
            }}
            className="w-4 h-4 m-[0.25rem] rounded focus:ring-blue-500/30 focus:ring-2 focus:ring-offset-gray-800 bg-gray-700 border-gray-600"
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor="checkbox-understand-2"
            className="ml-2 text-sm font-medium text-gray-300"
          >
            I understand it will take ~ 5 minutes for my funds to be converted.
          </label>
        </div>
      </div>

      <div>
        <Button
          size="full"
          disabled={!!ctaStatus || !chkbx1 || !chkbx2}
          onClick={() => callCTA(undefined)}
        >
          {!ctaStatus ? (
            "Confirm"
          ) : (
            <div className="flex flex-row gap-4 items-center mx-auto w-fit">
              <span>Converting $BIT</span>
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
            </div>
          )}
        </Button>
      </div>
    </>
  );
}
