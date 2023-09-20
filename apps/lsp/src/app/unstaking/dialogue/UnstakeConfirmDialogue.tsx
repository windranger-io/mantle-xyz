import DialogBase from "@components/Dialogue/DialogueBase";
import DialogValue from "@components/Dialogue/Value";
import Loading from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import useTxFeeEstimate from "@hooks/web3/read/useTxFeeEstimate";
import { Button, T } from "@mantle/ui";
import { formatEthTruncated, getMinimumAmount } from "@util/util";
import { Signature } from "ethers";
import { splitSignature } from "ethers/lib/utils";
import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";

type Props = {
  unstakeAmount: bigint;
  receiveAmount: bigint;
  permitSignature?: `0x${string}`;
  deadline: bigint;
  onClose: () => void;
  onUnstakeSuccess: (hash: string) => void;
  onUnstakeFailure: () => void;
};

export default function UnstakeConfirmDialogue({
  unstakeAmount,
  receiveAmount,
  permitSignature = undefined,
  deadline,
  onClose,
  onUnstakeSuccess,
  onUnstakeFailure,
}: Props) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];

  const [txGas, setTxGas] = useState<bigint>(BigInt(0));
  const { estimate: feeEstimate, isLoading: feeEstimateLoading } =
    useTxFeeEstimate(txGas);

  // Even with the prep hooks, the 'unstake' click is slow, so we manually track
  // the state so that we can disable the button immediately.
  const [isUnstaking, setIsUnstaking] = useState(false);

  // If we're using standard approvals, there may not be a signature.
  // Use this to decide whether we should use the permit function or not.
  let signature: Signature | undefined;
  if (permitSignature) {
    signature = splitSignature(permitSignature);
  }

  // When an account is connected, estimate the gas cost of the transaction.
  // This handles both standard approvals and permit approvals.
  useEffect(() => {
    if (!address || !publicClient || isUnstaking) {
      return;
    }

    const doEstimate = async () => {
      if (!signature) {
        // If we don't have a signature, we're using standard approvals.
        const gas = await publicClient.estimateContractGas({
          ...stakingContract,
          functionName: "unstakeRequest",
          args: [unstakeAmount, getMinimumAmount(receiveAmount)],
          account: address,
        });
        setTxGas(gas);
        return;
      }

      const gas = await publicClient.estimateContractGas({
        ...stakingContract,
        functionName: "unstakeRequestWithPermit",
        args: [
          unstakeAmount,
          getMinimumAmount(receiveAmount),
          deadline,
          signature.v,
          signature.r as `0x${string}`,
          signature.s as `0x${string}`,
        ],
        account: address,
      });
      setTxGas(gas);
    };

    doEstimate();
  }, [
    publicClient,
    address,
    stakingContract,
    unstakeAmount,
    receiveAmount,
    deadline,
    signature,
    isUnstaking,
  ]);

  // Prep writes for both standard approvals and permit approvals,
  // but enabled based on whether we have a signature or not.
  const unstakePrep = usePrepareContractWrite({
    ...stakingContract,
    args: [unstakeAmount, getMinimumAmount(receiveAmount)],
    functionName: "unstakeRequest",
    enabled: Boolean(address) && unstakeAmount > 0 && !signature,
  });

  const unstakePermitPrep = usePrepareContractWrite({
    ...stakingContract,
    args: [
      unstakeAmount,
      getMinimumAmount(receiveAmount),
      deadline,
      signature?.v || 0,
      signature?.r as `0x${string}`,
      signature?.s as `0x${string}`,
    ],
    functionName: "unstakeRequestWithPermit",
    enabled: Boolean(address) && unstakeAmount > 0 && Boolean(signature),
  });

  const { data, writeAsync: doUnstake } = useContractWrite(unstakePrep.config);
  const { data: dataPermit, writeAsync: doUnstakePermit } = useContractWrite(
    unstakePermitPrep.config
  );

  const resultData = signature ? dataPermit : data;
  const unstakeAction = useCallback(() => {
    setIsUnstaking(true);

    if (signature && doUnstakePermit) {
      doUnstakePermit();
      return;
    }
    doUnstake!();
  }, [signature, doUnstake, doUnstakePermit]);

  const { isError, isSuccess } = useWaitForTransaction({
    hash: resultData?.hash,
  });

  // Effect for executing callbacks when the transaction succeeds or fails.
  useEffect(() => {
    if (isError) {
      onUnstakeFailure();
      setIsUnstaking(false);
      return;
    }
    if (isSuccess && resultData) {
      onUnstakeSuccess(resultData.hash);
      setIsUnstaking(false);
    }
  }, [isSuccess, isError, resultData, onUnstakeSuccess, onUnstakeFailure]);

  return (
    <DialogBase isCloseable title="Confirm transaction" onClose={onClose}>
      <DialogValue
        label="Amount to unstake"
        value={
          <T variant="transactionTableHeading">
            {formatEthTruncated(unstakeAmount)} mETH
          </T>
        }
        border
      />
      <DialogValue
        label="You will receive"
        value={
          <T variant="transactionTableHeading">
            {formatEthTruncated(receiveAmount)} ETH
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
        disabled={!unstakeAction || isError || isUnstaking}
        onClick={unstakeAction}
        className="flex flex-row justify-center items-center"
      >
        Confirm{" "}
        {(isUnstaking || feeEstimateLoading) && (
          <span className="ml-2">
            <Loading />
          </span>
        )}
      </Button>
    </DialogBase>
  );
}
