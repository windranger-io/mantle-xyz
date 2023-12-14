import { TransactionResponse } from "@ethersproject/providers";
import { useState } from "react";
import { MessageLike, MessageStatus } from "@ethan-bedrock/sdk";
import { useMantleSDK } from "@providers/mantleSDKContext";

// call the prove method with the given tx
export function useCallProve(
  tx1: undefined | MessageLike,
  onSuccess?: (tx: TransactionResponse) => void
) {
  // pull state from context
  // const { tx2HashRef, setTx2Hash, setCTAPage } = useContext(StateContext);

  // import crosschain comms
  const { crossChainMessenger, getMessageStatus } = useMantleSDK();

  // const { switchToNetwork } = useSwitchToNetwork();

  // mark loading between callProve and the useEffect waiting for the finalizeMessage()
  const [isLoading, setIsLoading] = useState(false);

  // commit prove method...
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callProve = async () => {
    setIsLoading(true);
    if (tx1 && crossChainMessenger && getMessageStatus) {
      const status = await getMessageStatus(tx1);
      console.log("status: ", status);
      if (status === MessageStatus.READY_TO_PROVE) {
        const tx: TransactionResponse = await crossChainMessenger.proveMessage(
          tx1
        );
        if (onSuccess) {
          onSuccess(tx);
        }
      }
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    callProve,
  };
}
