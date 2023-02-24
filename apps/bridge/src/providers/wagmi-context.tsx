import {
  WagmiConfig,
  configureChains,
  createClient
} from 'wagmi';
import { goerli } from 'wagmi/chains';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { MANTLE_TESTNET_CHAIN } from 'src/config/mantle-chain';

// eslint-disable-next-line turbo/no-undeclared-env-vars
if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  throw new Error('NEXT_PUBLIC_ALCHEMY_API_KEY is missing!');
}
// eslint-disable-next-line turbo/no-undeclared-env-vars
if (!process.env.NEXT_PUBLIC_INFURA_API_KEY) {
  throw new Error('NEXT_PUBLIC_INFURA_API_KEY is missing!');
}

const {
  chains,
  provider,
  webSocketProvider
} = configureChains(
  // TODO: configure and manage supported chains
  [
    goerli,
    MANTLE_TESTNET_CHAIN
  ],
  [
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }),
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY }),
    jsonRpcProvider({
      rpc: chain => ({
        http: chain.rpcUrls.default.http[0]
      })
    }),
    publicProvider()
  ],
  { targetQuorum: 1 }
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi'
      }
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true
      }
    }),
    new InjectedConnector({
      chains,
      options: {
        name: detectedName =>
          `Injected (${typeof detectedName === 'string' ?
            detectedName :
            detectedName.join(', ')
          })`,
        shimDisconnect: true
      }
    })
  ],
  provider,
  webSocketProvider
});

interface WagmiProviderProps {
  children: React.ReactNode;
}

function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiConfig client={client}>
      {children}
    </WagmiConfig>
  );
}

export { WagmiProvider };
