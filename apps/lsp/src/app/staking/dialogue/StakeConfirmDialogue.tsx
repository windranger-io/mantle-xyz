import DialogBase from "@components/Dialogue/DialogueBase";
// import { Button, Typography } from "@mantle/ui";

type Props = {
  stakeAmount: bigint;
  onClose: () => void;
};

export default function StakeConfirmDialogue({ stakeAmount, onClose }: Props) {
  return (
    <DialogBase isCloseable title="Confirm transaction" onClose={onClose}>
      {stakeAmount.toString()}
    </DialogBase>
  );
}
