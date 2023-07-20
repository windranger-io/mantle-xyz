import {
  L1_CHAIN_ID,
  L1_BITDAO_TOKEN,
  L1_MANTLE_TOKEN,
} from "@config/constants";

import { useContext, useEffect, useMemo } from "react";
import StateContext from "@providers/stateContext";
import Image from "next/image";

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
        <Typography variant="modalHeading">Confirm migration</Typography>
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
              />
            </div>
          }
          border
        />
        {/* <Values label="Time to migrate" value="~5 minutes" border /> */}
        <Values
          label="Expected gas fee"
          value={`~${
            isActualGasFeeInfinity
              ? Infinity.toLocaleString()
              : formatUnits(parseUnits(actualGasFee, "gwei"), 18)
          } ETH`}
          border={false}
        />

        <Button
          size="full"
          disabled={!!ctaStatus}
          onClick={() => callCTA(undefined)}
        >
          {!ctaStatus ? (
            "Confirm"
          ) : (
            <div className="flex flex-row gap-4 items-center mx-auto w-fit">
              <span>Confirm with your wallet now.</span>
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
