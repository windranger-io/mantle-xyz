import DialogBase from "@components/Dialogue/DialogueBase";
import Failure from "@components/Icons/Failure";
import { Button, T } from "@mantle/ui";

type Props = {
  onClose: () => void;
};

export default function StakeFailureDialogue({ onClose }: Props) {
  return (
    <DialogBase isCloseable title="Transaction failed" onClose={onClose}>
      <div className="flex flex-col space-y-8 items-center justify-center">
        <Failure />
        <T variant="body22">Something went wrong. Try again.</T>
        <Button
          size="full"
          onClick={onClose}
          className="flex flex-row justify-center items-center"
        >
          Try again
        </Button>
      </div>
    </DialogBase>
  );
}
