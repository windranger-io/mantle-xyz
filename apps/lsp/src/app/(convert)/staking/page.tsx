"use client";

import { redirect } from "next/navigation";
import { BigNumber } from "ethers";
import { useContext, useState } from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { formatEther, parseEther } from "ethers/lib/utils";
import { Button, T } from "@mantle/ui";
import { formatEthTruncated } from "@util/util";
import { IconWarn } from "@mantle/ui/src/LocaleSwitcher/Button/Icons";

import AdjustmentRate from "@components/Convert/AdjustmentRate";
import ExchangeRate from "@components/Convert/ExchangeRate";
import ConvertInput from "@components/Convert/Input";
import ConvertOutput from "@components/Convert/Output";
import StakeToggle, { Mode } from "@components/StakeToggle";
import TokenDirection from "@components/TokenDirection";
import { AMOUNT_MAX_DISPLAY_DIGITS, CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import Divider from "@components/Convert/Divider";
import StateContext from "@providers/stateContext";
import useGeolocationCheck from "@hooks/useGeolocationCheck";
import StakeConfirmDialogue from "./dialogue/StakeConfirmDialogue";
import StakeSuccessDialogue from "./dialogue/StakeSuccessDialogue";
import StakeFailureDialogue from "./dialogue/StakeFailureDialogue";

export default function Staking() {
  const { address } = useAccount();
  const balance = useBalance({ address, watch: true });
  const [ethAmount, setEthAmount] = useState<BigNumber>(BigNumber.from(0));
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [failureDialogOpen, setFailureDialogOpen] = useState(false);
  const [stakeTxHash, setStakeTxHash] = useState("");
  const { isRestricted } = useGeolocationCheck();

  // Controls for wallet connection button
  const { setWalletModalOpen, setMobileMenuOpen } = useContext(StateContext);

  const balanceString =
    balance.data?.formatted.slice(0, AMOUNT_MAX_DISPLAY_DIGITS) || "";

  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const outputAmount = useContractRead({
    ...stakingContract,
    functionName: "ethToMETH",
    args: [ethAmount.toBigInt()],
    enabled: Boolean(address) && Number(ethAmount) > 0,
  });

  const minStakeAmount = useContractRead({
    ...stakingContract,
    functionName: "minimumStakeBound",
    enabled: Boolean(address),
  });

  const formattedOutput = outputAmount.data
    ? formatEther(outputAmount.data)
    : "0";

  // Redirect if in a restricted country
  if (isRestricted) {
    redirect("/restricted");
  }

  if (stakeTxHash) {
    return (
      <StakeSuccessDialogue
        hash={stakeTxHash}
        onClose={() => {
          setStakeTxHash("");
        }}
      />
    );
  }

  if (failureDialogOpen) {
    return (
      <StakeFailureDialogue
        onClose={() => {
          setFailureDialogOpen(false);
        }}
      />
    );
  }

  if (confirmDialogOpen) {
    return (
      <StakeConfirmDialogue
        onClose={() => {
          setConfirmDialogOpen(false);
        }}
        stakeAmount={ethAmount.toBigInt()}
        receiveAmount={outputAmount.data || BigInt(0)}
        onStakeSuccess={(hash: string) => {
          setConfirmDialogOpen(false);
          setStakeTxHash(hash);
          setEthAmount(BigNumber.from(0));
        }}
        onStakeFailure={() => {
          setConfirmDialogOpen(false);
          setFailureDialogOpen(true);
        }}
      />
    );
  }

  const inputOverBalance = ethAmount.gt(
    balance.data?.value || BigNumber.from(0)
  );

  const belowMinimumAmount =
    ethAmount.gt(0) && minStakeAmount.data && ethAmount.lt(minStakeAmount.data);

  const hasError = Boolean(inputOverBalance || belowMinimumAmount);

  let buttonText = address ? "Stake" : "Connect wallet";
  if (inputOverBalance) {
    buttonText = "Insufficient balance";
  }

  let errorText = "";
  if (inputOverBalance) {
    errorText = "Insufficient balance";
  }
  if (belowMinimumAmount) {
    errorText = `Must stake at least ${formatEthTruncated(
      minStakeAmount.data || 1e17
    )}`;
  }

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
          defaultAmount={
            // Ensures that a value exists when we render the dialogue and close it again.
            ethAmount && ethAmount.gt(0) ? formatEther(ethAmount) : ""
          }
          onChange={(val: string) => {
            if (!val) {
              setEthAmount(BigNumber.from(0));
              return;
            }
            setEthAmount(parseEther(val));
          }}
        />
        {balance.data && (
          <div className="flex flex-col w-full justify-end text-right">
            <div className="flex justify-between">
              {hasError ? (
                <div className="inline-flex justify-center items-center text-red-700">
                  <IconWarn className="w-4 h-4 mr-2" /> {errorText}
                </div>
              ) : (
                <span />
              )}
              <div className="flex space-x-1 items-center">
                <T variant="body">
                  Available:{" "}
                  {balance.data.formatted.slice(0, AMOUNT_MAX_DISPLAY_DIGITS)}
                </T>
              </div>
            </div>
          </div>
        )}
      </div>
      <Divider />
      <div className="py-5 px-5">
        <ConvertOutput
          symbol="mETH"
          isLoading={outputAmount.isLoading}
          amount={formattedOutput}
        />
      </div>
      <div className="p-5">
        <Button
          size="full"
          className="mb-4"
          disabled={outputAmount.isLoading || hasError}
          onClick={() => {
            if (!address) {
              setWalletModalOpen(true);
              setMobileMenuOpen(false);
              return;
            }
            setConfirmDialogOpen(true);
          }}
        >
          {buttonText}
        </Button>
        <div className="flex flex-col space-y-2 w-full">
          <ExchangeRate />
          <AdjustmentRate />
        </div>
      </div>
    </div>
  );
}
