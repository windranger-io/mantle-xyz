import DialogBase from "@components/Dialogue/DialogueBase";
import DialogValue from "@components/Dialogue/Value";
import Loading from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { Button, T } from "@mantle/ui";
import { formatEthTruncated, getMinimumAmount } from "@util/util";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  useFeeData,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
// import { Button, Typography } from "@mantle/ui";

type Props = {
  stakeAmount: bigint;
  receiveAmount: bigint;
  onClose: () => void;
  onStakeSuccess: (hash: string) => void;
};

export default function StakeConfirmDialogue({
  stakeAmount,
  receiveAmount,
  onClose,
  onStakeSuccess,
}: Props) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const {
    data: feeData,
    isError: feeDataError,
    isLoading: feeDataLoading,
  } = useFeeData();
  const [stakeGas, setStakeGas] = useState<bigint>(BigInt(0));

  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  useEffect(() => {
    if (!address || !publicClient) {
      return;
    }

    const doEstimate = async () => {
      const gas = await publicClient.estimateContractGas({
        ...stakingContract,
        functionName: "stake",
        value: stakeAmount,
        args: [getMinimumAmount(receiveAmount)],
        account: address,
      });
      setStakeGas(gas);
    };

    doEstimate();
  }, [publicClient, address, stakingContract, stakeAmount, receiveAmount]);

  const stakePrep = usePrepareContractWrite({
    ...stakingContract,
    value: stakeAmount,
    args: [getMinimumAmount(receiveAmount)],
    functionName: "stake",
    enabled: Boolean(address) && stakeAmount > 0,
  });

  const { data, writeAsync: doStake } = useContractWrite(stakePrep.config);
  const { isLoading, isError, error, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (isError) {
      // TODO
      console.log(error);
      return;
    }
    if (isSuccess && data) {
      onStakeSuccess(data.hash);
    }
  }, [isSuccess, isError, data, error, onStakeSuccess]);

  const feeEstimate = feeData?.lastBaseFeePerGas
    ? feeData.lastBaseFeePerGas * stakeGas
    : null;

  return (
    <DialogBase isCloseable title="Confirm transaction" onClose={onClose}>
      <DialogValue
        label="Amount to stake"
        value={
          <T variant="transactionTableHeading">
            {formatEthTruncated(stakeAmount)} ETH
          </T>
        }
        border
      />
      <DialogValue
        label="You will receive"
        value={
          <T variant="transactionTableHeading">
            {formatEthTruncated(receiveAmount)} mETH
          </T>
        }
        border
      />
      {!feeDataError && (
        <DialogValue
          label="Transaction cost"
          value={
            <T variant="transactionTableHeading">
              {feeDataLoading || feeEstimate === null ? (
                <Loading />
              ) : (
                `~${formatEthTruncated(feeEstimate)} ETH`
              )}
            </T>
          }
        />
      )}
      <Button
        size="full"
        disabled={!doStake || isError || isLoading}
        onClick={doStake}
        className="flex flex-row justify-center items-center"
      >
        Confirm{" "}
        {(isLoading || feeDataLoading) && (
          <span className="ml-2">
            <Loading />
          </span>
        )}
      </Button>
    </DialogBase>
  );
}
