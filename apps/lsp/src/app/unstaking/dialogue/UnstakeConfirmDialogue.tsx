import DialogBase from "@components/Dialogue/DialogueBase";
import DialogValue from "@components/Dialogue/Value";
import Loading from "@components/Loading";
import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { Button, T } from "@mantle/ui";
import { formatEthTruncated, getMinimumAmount } from "@util/util";
import { Signature } from "ethers";
import { splitSignature } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  useFeeData,
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
  permitSignature,
  deadline,
  onClose,
  onUnstakeSuccess,
  onUnstakeFailure,
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

  // If we're using standard approvals, there may not be a signature.
  // Use this to decide whether we should use the permit function or not.
  let signature: Signature | undefined;
  if (permitSignature) {
    signature = splitSignature(permitSignature);
  }

  useEffect(() => {
    if (!address || !publicClient) {
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
        setStakeGas(gas);
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
      setStakeGas(gas);
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
  ]);

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
  const unstakeAction = signature ? doUnstakePermit : doUnstake;

  const { isLoading, isError, isSuccess } = useWaitForTransaction({
    hash: resultData?.hash,
  });

  useEffect(() => {
    if (isError) {
      onUnstakeFailure();
      return;
    }
    if (isSuccess && data) {
      onUnstakeSuccess(data.hash);
    }
  }, [isSuccess, isError, data, onUnstakeSuccess, onUnstakeFailure]);

  const feeEstimate = feeData?.lastBaseFeePerGas
    ? feeData.lastBaseFeePerGas * stakeGas
    : null;

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
        disabled={!unstakeAction || isError || isLoading}
        onClick={unstakeAction}
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

UnstakeConfirmDialogue.defaultProps = {
  permitSignature: undefined,
};
