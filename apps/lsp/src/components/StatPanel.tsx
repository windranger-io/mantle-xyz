"use client";

import { useContractRead } from "wagmi";
import { T } from "@mantle/ui";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { formatEthTruncated } from "@util/util";

import Loading from "./Loading";

export default function StatPanel() {
  const oracleContract = contracts[CHAIN_ID][ContractName.Oracle];

  const oracleRecord = useContractRead({
    ...oracleContract,
    functionName: "latestRecord",
    enabled: true,
  });

  return (
    <div className="max-w-[484px] relative border border-[#1C1E20] bg-black p-4 mx-auto rounded-xl w-full overflow-x-auto">
      <div className="flex flex-row justify-between items-center">
        <T>APY (estimated)</T>
        <T className="text-white font-medium text-lg">~5%</T>
      </div>
      <hr className="border-[#1C1E20] my-2" />
      <div className="flex flex-row justify-between items-center">
        <T>TVL</T>
        {oracleRecord.isLoading ||
        oracleRecord?.data?.currentTotalValidatorBalance === undefined ? (
          <Loading />
        ) : (
          <T className="text-white font-medium text-lg">
            {formatEthTruncated(oracleRecord.data.currentTotalValidatorBalance)}{" "}
            ETH
          </T>
        )}
      </div>
    </div>
  );
}
