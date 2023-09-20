import DialogBase from "@components/Dialogue/DialogueBase";
import DialogValue from "@components/Dialogue/Value";
import Loading from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import useTxFeeEstimate from "@hooks/web3/read/useTxFeeEstimate";
import { Button, T } from "@mantle/ui";
import { formatEthTruncated, getMinimumAmount } from "@util/util";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";

type Props = {
  stakeAmount: bigint;
  receiveAmount: bigint;
  onClose: () => void;
  onStakeSuccess: (hash: string) => void;
  onStakeFailure: () => void;
};

export default function StakeConfirmDialogue({
  stakeAmount,
  receiveAmount,
  onClose,
  onStakeSuccess,
  onStakeFailure,
}: Props) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const [txGas, setTxGas] = useState<bigint>(BigInt(0));
  const { estimate: feeEstimate, isLoading: feeEstimateLoading } =
    useTxFeeEstimate(txGas);

  // Even with the prep hooks, the 'stake' click is slow, so we manually track
  // the state so that we can disable the button immediately.
  const [isStaking, setIsStaking] = useState(false);

  useEffect(() => {
    if (!address || !publicClient || isStaking) {
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
      setTxGas(gas);
    };

    doEstimate();
  }, [
    publicClient,
    address,
    stakingContract,
    stakeAmount,
    receiveAmount,
    isStaking,
  ]);

  const stakePrep = usePrepareContractWrite({
    ...stakingContract,
    value: stakeAmount,
    args: [getMinimumAmount(receiveAmount)],
    functionName: "stake",
    enabled: Boolean(address) && stakeAmount > 0,
  });

  const {
    data,
    isError,
    writeAsync: doStake,
  } = useContractWrite(stakePrep.config);
  const { isError: txWaitError, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (isError || txWaitError) {
      setIsStaking(false);
      onStakeFailure();
      return;
    }
    if (isSuccess && data) {
      setIsStaking(false);
      onStakeSuccess(data.hash);
    }
  }, [isSuccess, isError, txWaitError, data, onStakeSuccess, onStakeFailure]);

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
      <DialogValue
        label="Transaction cost"
        value={
          <T variant="transactionTableHeading">
            {feeEstimateLoading || feeEstimate === null ? (
              <Loading />
            ) : (
              `~${formatEthTruncated(feeEstimate)} ETH`
            )}
          </T>
        }
      />
      <Button
        size="full"
        disabled={!doStake || isError || isStaking}
        onClick={() => {
          setIsStaking(true);
          doStake!();
        }}
        className="flex flex-row justify-center items-center"
      >
        Confirm{" "}
        {(isStaking || feeEstimateLoading) && (
          <span className="ml-2">
            <Loading />
          </span>
        )}
      </Button>
    </DialogBase>
  );
}
