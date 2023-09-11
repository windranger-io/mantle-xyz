"use client";

import ExchangeRate from "@components/Convert/ExchangeRate";
import ConvertInput from "@components/Convert/Input";
import ConvertOutput from "@components/Convert/Output";
import StakeToggle, { Mode } from "@components/StakeToggle";
import TokenDirection from "@components/TokenDirection";
import { AMOUNT_MAX_DISPLAY_DIGITS, CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { Button, Typography } from "@mantle/ui";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useState } from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";

export default function Staking() {
  const { address } = useAccount();
  const balance = useBalance({ address, watch: true });
  const [ethAmount, setEthAmount] = useState<BigNumber>(BigNumber.from(0));

  const balanceString =
    balance.data?.formatted.slice(0, AMOUNT_MAX_DISPLAY_DIGITS) || "";

  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const outputAmount = useContractRead({
    ...stakingContract,
    functionName: "ethToMETH",
    args: [ethAmount.toBigInt()],
    enabled: Boolean(address) && Number(ethAmount) > 0,
  });

  const formattedOutput = outputAmount.data
    ? formatEther(outputAmount.data)
    : "0";

  return (
    <div className="max-w-[484px] w-full grid relative bg-white/5 overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-t-[30px] rounded-b-[20px] mx-auto">
      <div className="p-5">
        <StakeToggle selected={Mode.STAKE} />
      </div>
      <TokenDirection mode={Mode.STAKE} />
      <div className="py-5 px-5 bg-white bg-opacity-5">
        <ConvertInput
          symbol="ETH"
          balance={balanceString}
          onChange={(val: string) => {
            setEthAmount(parseEther(val));
          }}
        />
        {balance.data && (
          <div className="flex flex-col w-full justify-end text-right">
            <div className="flex justify-end">
              <div className="flex space-x-1 items-center">
                <Typography variant="body">
                  Available:{" "}
                  {balance.data.formatted.slice(0, AMOUNT_MAX_DISPLAY_DIGITS)}
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="py-5 px-5">
        <ConvertOutput
          symbol="mETH"
          isLoading={outputAmount.isLoading}
          amount={formattedOutput}
        />
      </div>
      <div className="flex flex-col p-5">
        <Button size="full" className="mb-4">
          Stake
        </Button>
        <ExchangeRate />
      </div>
    </div>
  );
}
