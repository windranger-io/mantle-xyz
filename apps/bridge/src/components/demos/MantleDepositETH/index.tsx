import { MessageStatus } from '@mantleio/sdk';
import { goerli } from 'wagmi/chains';
import { parseEther } from '@ethersproject/units';
import { useMutation } from '@tanstack/react-query';

import BasicButton from 'src/components/buttons/BasicButton';
import { useMantleSDK } from 'src/providers/mantle-sdk-context';
import useSafeNetwork from 'src/utils/hooks/use-safe-network';
import { getErrorMessage } from 'src/utils/helpers/error-handling';

interface Props {
  tokenAmount: number;
}

// RE: https://mantlenetworkio.github.io/mantle-tutorial/cross-dom-bridge-eth/
// How to deposit ETH from L1 to L2
function MantleDepositETH({
  tokenAmount
}: Props) {
  const { chain } = useSafeNetwork();

  const connectedChainID = chain.id;

  const { crossChainMessenger } = useMantleSDK();

  const {
    mutate: depositETHMutate,
    isLoading: depositETHMutateIsLoading,
    isError: depositETHMutateIsError,
    error: depositETHMutateError,
    isSuccess: depositETHMutateIsSuccess
  } = useMutation({
    mutationFn: async (depositETHAmount: number) => {
      if (crossChainMessenger === undefined) {
        throw new Error('Something went wrong!');
      }

      // eslint-disable-next-line no-console
      console.log('Deposit ETH');

      const startTime = new Date().getTime();

      const bigDepositETHAmount = parseEther(depositETHAmount.toString());
      const response = await crossChainMessenger.depositETH(bigDepositETHAmount);

      // eslint-disable-next-line no-console
      console.log(`Transaction hash (on L1): ${response.hash}`);

      await response.wait();

      // eslint-disable-next-line no-console
      console.log('Waiting for status to change to RELAYED');

      // eslint-disable-next-line no-console
      console.log(`Time so far ${(new Date().getTime() - startTime) / 1000} seconds`);

      await crossChainMessenger.waitForMessageStatus(response, MessageStatus.RELAYED);

      // eslint-disable-next-line no-console
      console.log(`depositETH took ${(new Date().getTime() - startTime) / 1000} seconds\n\n`);
    },
    onError: error => {
      const errorMessage = getErrorMessage(error);

      // eslint-disable-next-line no-console
      console.log('[Deposit ETH] errorMessage => ', errorMessage);
    },
    onSuccess: () => {
      // eslint-disable-next-line no-console
      console.log('[Deposit ETH] deposited!');
    }
  });

  const handleDepositETH = () => {
    if (connectedChainID !== goerli.id) {
      alert(`You need to switch to ${goerli.name} in order to deposit!`);
      return;
    }

    depositETHMutate(tokenAmount);
  };

  return (
    <div>
      <h3>Depositing ETH with the Mantlenetworkio SDK</h3>
      <BasicButton
        onClick={handleDepositETH}
        disabled={depositETHMutateIsLoading}>
        {`${depositETHMutateIsLoading ? 'Depositing' : 'Deposit'} ${tokenAmount} ETH`}
      </BasicButton>
      {depositETHMutateIsError ? (
        <div>An error occurred: {getErrorMessage(depositETHMutateError)}</div>
      ) : null}
      {depositETHMutateIsSuccess ? <div>{tokenAmount} deposited!</div> : null}
    </div>
  );
}

export default MantleDepositETH;
