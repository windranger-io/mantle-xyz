import { MessageStatus } from '@mantleio/sdk';
import { goerli } from 'wagmi';
import {
  useMutation,
  QueryObserverResult
} from '@tanstack/react-query';
import clsx from 'clsx';

import BasicButton, { Props as BasicButtonProps } from 'src/components/buttons/BasicButton';
import { useMantleSDK } from 'src/providers/mantle-sdk-context';
import useSafeNetwork from 'src/utils/hooks/use-safe-network';
import { getErrorMessage } from 'src/utils/helpers/error-handling';
import {
  WithdrawalItem,
  WithdrawalsData
} from 'src/types/mantle.d';

interface Props extends BasicButtonProps {
  item: WithdrawalItem;
  withdrawalsRefetch: () => Promise<QueryObserverResult<WithdrawalsData, unknown>>;
}

function WithdrawalClaimButton({
  item,
  withdrawalsRefetch,
  ...rest
}: Props) {
  const { chain } = useSafeNetwork();

  const connectedChainID = chain.id;

  const { crossChainMessenger } = useMantleSDK();

  const {
    mutate: claimMutate,
    isLoading: claimMutateIsLoading,
    isError: claimMutateIsError,
    error: claimMutateError,
    isSuccess: claimMutateIsSuccess
  } = useMutation({
    mutationFn: async () => {
      if (crossChainMessenger === undefined) {
        throw new Error('Something went wrong!');
      }

      // eslint-disable-next-line no-console
      console.log('Claim');

      const startTime = new Date().getTime();

      // eslint-disable-next-line no-console
      console.log('Ready for relay, finalizing message now');

      // eslint-disable-next-line no-console
      console.log(`Time so far ${(new Date().getTime() - startTime) / 1000} seconds`);

      const response = await crossChainMessenger.finalizeMessage(item.transactionHash);

      await response.wait();

      // eslint-disable-next-line no-console
      console.log('Waiting for status to change to RELAYED');

      // eslint-disable-next-line no-console
      console.log(`Time so far ${(new Date().getTime() - startTime) / 1000} seconds`);

      await crossChainMessenger.waitForMessageStatus(item.transactionHash, MessageStatus.RELAYED);

      // eslint-disable-next-line no-console
      console.log(`claim took ${(new Date().getTime() - startTime) / 1000} seconds\n\n`);

      await withdrawalsRefetch();
    },
    onError: error => {
      const errorMessage = getErrorMessage(error);

      // eslint-disable-next-line no-console
      console.log('[Claim] errorMessage => ', errorMessage);
    },
    onSuccess: () => {
      // eslint-disable-next-line no-console
      console.log('[Claim] claimed!');
    }
  });

  const handleClaim = async () => {
    if (connectedChainID !== goerli.id) {
      alert(`You need to switch to ${goerli.name} in order to claim!`);
      return;
    }

    claimMutate();
  };

  return (
    <div
      className={clsx(
        'flex',
        'items-center',
        'space-x-2'
      )}>
      <BasicButton
        onClick={handleClaim}
        disabled={claimMutateIsLoading}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}>
        {`${claimMutateIsLoading ? 'Claiming' : 'Claim'}`}
      </BasicButton>
      {claimMutateIsError ? (
        <div>An error occurred: {getErrorMessage(claimMutateError)}</div>
      ) : null}
      {claimMutateIsSuccess ? <div>claimed!</div> : null}
    </div>
  );
}

export default WithdrawalClaimButton;
