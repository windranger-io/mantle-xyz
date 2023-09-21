import DialogBase from "@components/Dialogue/DialogueBase";
import Check from "@components/Icons/Check";
import Loading from "@components/Loading";
import TxLink from "@components/TxLink";
import { CHAIN_ID } from "@config/constants";
import useMETHBalance from "@hooks/web3/read/useMETHBalance";
import { Button, T } from "@mantle/ui";
import { useAccount } from "wagmi";

type Props = {
  hash: string;
  onClose: () => void;
};

export default function UnstakeSuccessDialogue({ hash, onClose }: Props) {
  const { address } = useAccount();
  const methBalance = useMETHBalance(address);

  return (
    <DialogBase isCloseable title="Request submitted" onClose={onClose}>
      <div className="flex flex-col space-y-8 items-center justify-center">
        <Check />
        {!methBalance.isLoading && methBalance.data ? (
          <T variant="body22" className="text-center">
            Your unstake request was successful. Please check back in a few days
            to claim your ETH.
          </T>
        ) : (
          <Loading />
        )}
        <TxLink asHash={false} txHash={hash} chainId={CHAIN_ID} />

        <Button
          size="full"
          onClick={onClose}
          className="flex flex-row justify-center items-center"
        >
          Close
        </Button>
      </div>
    </DialogBase>
  );
}
