import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect
} from 'wagmi';
import clsx from 'clsx';
import { Web3Provider } from '@ethersproject/providers';

import BasicButton from 'src/components/buttons/BasicButton';
import {
  MANTLE_TESTNET_CHAIN_PARAMS,
  MANTLE_TESTNET_CHAIN_ID
} from 'src/config/mantle-chain';
import { getErrorMessage } from 'src/utils/helpers/error-handling';

// Temporary flag
const shouldAddMantleTestnet = false;

function Wagmi() {
  const {
    address,
    connector,
    isConnected
  } = useAccount();

  const {
    connectAsync,
    connectors,
    error,
    isLoading,
    pendingConnector
  } = useConnect();

  const { disconnect } = useDisconnect();

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleConnect = async (connector: Connector) => {
    try {
      const {
        provider,
        chain
      } = await connectAsync({ connector });

      if (shouldAddMantleTestnet && chain.id !== MANTLE_TESTNET_CHAIN_ID) {
        const web3Provider = new Web3Provider(provider as any);
        // Add the mantle chain to the user's wallet
        await web3Provider.send('wallet_addEthereumChain', [MANTLE_TESTNET_CHAIN_PARAMS]);
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);

      // eslint-disable-next-line no-console
      console.log('[handleConnect] errorMessage => ', errorMessage);
    }
  };

  if (isConnected) {
    return (
      <div>
        <div>{address}</div>
        <div>Connected to {connector?.name}</div>
        <BasicButton
          onClick={() => disconnect()}>
          Disconnect
        </BasicButton>
      </div>
    );
  }

  return (
    <div>
      <ul
        className={clsx(
          'max-w-xs',
          'space-y-4'
        )}>
        {connectors.map(item => (
          <li key={item.id}>
            <BasicButton
              className={clsx(
                'w-full'
              )}
              disabled={
                !item.ready ||
                isLoading
              }
              onClick={() => handleConnect(item)}>
              {item.name}
              {!item.ready && ' (unsupported)'}
              {isLoading && item.id === pendingConnector?.id && ' (connecting)'}
            </BasicButton>
          </li>
        ))}
      </ul>
      {error && <p role='alert'>{error.message}</p>}
    </div>
  );
}

export default Wagmi;
