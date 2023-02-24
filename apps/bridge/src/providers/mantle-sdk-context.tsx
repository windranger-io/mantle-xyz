import * as React from 'react';
import { CrossChainMessenger } from '@mantleio/sdk';
import { goerli } from 'wagmi/chains';
import {
  useSigner,
  useProvider
} from 'wagmi';
import type { FallbackProvider } from '@ethersproject/providers';
import {
  withErrorBoundary,
  useErrorHandler
} from 'react-error-boundary';

import ErrorFallback from 'src/components/ErrorFallback';
import { MANTLE_TESTNET_CHAIN_ID } from 'src/config/mantle-chain';
import useSafeNetwork from 'src/utils/hooks/use-safe-network';

const GOERLI_CHAIN_ID = goerli.id;

const MantleSDKContext = React.createContext<{
  crossChainMessenger: CrossChainMessenger | undefined;
} | undefined>(undefined);

interface MantleSDKProviderProps {
  children: React.ReactNode;
}

function MantleSDKProvider({ children }: MantleSDKProviderProps) {
  const { chain } = useSafeNetwork();

  const connectedChainID = chain.id;

  const {
    data: goerliSigner,
    error: goerliSignerError,
    isLoading: goerliSignerIsLoading
  } = useSigner({
    chainId: GOERLI_CHAIN_ID
  });
  useErrorHandler(goerliSignerError);

  const goerliProvider = useProvider({
    chainId: GOERLI_CHAIN_ID
  });

  const {
    data: mantleTestnetSigner,
    error: mantleTestnetSignerError,
    isLoading: mantleTestnetSignerIsLoading
  } = useSigner({
    chainId: MANTLE_TESTNET_CHAIN_ID
  });
  useErrorHandler(mantleTestnetSignerError);

  const mantleTestnetProvider = useProvider({
    chainId: MANTLE_TESTNET_CHAIN_ID
  });

  const crossChainMessenger = React.useMemo(() => {
    if (
      goerliSigner === undefined ||
      goerliSigner === null ||
      mantleTestnetSigner === undefined ||
      mantleTestnetSigner === null ||
      !goerliProvider ||
      !mantleTestnetProvider
    ) return;

    return new CrossChainMessenger({
      l1ChainId: GOERLI_CHAIN_ID,
      l2ChainId: MANTLE_TESTNET_CHAIN_ID,
      l1SignerOrProvider: connectedChainID === GOERLI_CHAIN_ID ? goerliSigner : goerliProvider,
      l2SignerOrProvider:
        connectedChainID === MANTLE_TESTNET_CHAIN_ID ?
          mantleTestnetSigner :
          // RE: https://github.com/ethers-io/ethers.js/discussions/2703
          (mantleTestnetProvider as FallbackProvider).providerConfigs[0].provider
    });
  }, [
    goerliSigner,
    goerliProvider,
    mantleTestnetSigner,
    mantleTestnetProvider,
    connectedChainID
  ]);

  // TODO: improve UX
  if (goerliSignerIsLoading || mantleTestnetSignerIsLoading) {
    return <div>Loading...</div>;
  }

  const value = { crossChainMessenger };

  return (
    <MantleSDKContext.Provider value={value}>
      {children}
    </MantleSDKContext.Provider>
  );
}

const useMantleSDK = () => {
  const context = React.useContext(MantleSDKContext);

  if (context === undefined) {
    throw new Error('useMantleSDK must be used within a CountProvider!');
  }
  return context;
};

const MantleSDKProviderWithErrorBoundary = withErrorBoundary(MantleSDKProvider, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});

export {
  MantleSDKProviderWithErrorBoundary as MantleSDKProvider,
  useMantleSDK
};
