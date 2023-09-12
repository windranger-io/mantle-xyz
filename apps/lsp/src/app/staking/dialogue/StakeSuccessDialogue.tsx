import DialogBase from "@components/Dialogue/DialogueBase";
import DialogValue from "@components/Dialogue/Value";
import { Button, T } from "@mantle/ui";

type Props = {
  hash: string;
  onClose: () => void;
};

export default function StakeSuccessDialogue({ hash, onClose }: Props) {
  return (
    <DialogBase isCloseable title="Transaction complete" onClose={onClose}>
      <DialogValue
        label="Amount to stake"
        value={<T variant="transactionTableHeading">{hash}</T>}
        border
      />
      <Button
        size="full"
        onClick={onClose}
        className="flex flex-row justify-center items-center"
      >
        Close
      </Button>
    </DialogBase>
  );
}
