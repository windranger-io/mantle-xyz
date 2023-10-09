import {
  ProviderRpcError,
  ResourceUnavailableRpcError,
  UserRejectedRequestError,
  getAddress,
  type Address,
} from "viem";
import type { Chain } from "viem/chains";

import { ConnectorNotFoundError, WindowProvider } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export type InjectedConnectorOptions = {
  name?: string | ((detectedName: string | string[]) => string);
};

export type BybitWalletConnectorOptions = InjectedConnectorOptions;
// declare global {
//   interface Window {
//     bybitWallet?: {
//       bnbSign?: (
//         address: string,
//         message: string
//       ) => Promise<{ publicKey: string; signature: string }>;
//       switchNetwork?: (networkId: string) => Promise<string>;
//     } & WindowProvider;
//   }
// }
declare global {
  interface Window {
    bybitWallet?: WindowProvider & { isBybit: boolean };
  }
}

export function getBybitWalletProvider(): WindowProvider | undefined {
  const isBybitWallet = (bybitWallet: NonNullable<Window["bybitWallet"]>) => {
    // Identify if Trust Wallet injected provider is present.
    const provider = !!bybitWallet.isBybit;

    return provider;
  };

  const injectedProviderExist =
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    typeof window.bybitWallet !== "undefined";

  // No injected providers exist.
  if (!injectedProviderExist) {
    return undefined;
  }

  // Trust Wallet was injected into window.ethereum.
  if (isBybitWallet(window.bybitWallet as NonNullable<Window["bybitWallet"]>)) {
    return window.bybitWallet;
  }

  // Trust Wallet provider might be replaced by another
  // injected provider, check the providers array.
  // if (window.ethereum?.providers) {
  //   return window.ethereum.providers.find(isBybitWallet)
  // }

  // In some cases injected providers can replace window.ethereum
  // without updating the providers array. In those instances the Trust Wallet
  // can be installed and its provider instance can be retrieved by
  // looking at the global `trustwallet` object.
  return window.bybitWallet;
}
export class BybitWalletConnector extends InjectedConnector {
  readonly id = "bybitWallet";

  readonly name = "BybitWallet";

  readonly ready =
    typeof window !== "undefined" && typeof window.bybitWallet !== "undefined";

  provider?: Window["bybitWallet"];

  // constructor(config: {
  //   chains?: Chain[];
  //   options: BybitWalletConnectorOptions;
  // }) {
  //   const options = {
  //     name: "BybitWallet",
  //     getProvider() {
  //       console.log("bybit");
  //       const bybitWallet = (
  //         window as unknown as {
  //           bybitWallet?: WindowProvider;
  //         }
  //       ).bybitWallet;
  //       if (bybitWallet) {
  //         return bybitWallet;
  //       }
  //       const web3 = (
  //         window as unknown as {
  //           web3?: WindowProvider;
  //         }
  //       ).web3;
  //       if (web3?.request) {
  //         return web3;
  //       }
  //     },
  //   };
  //   super(config);
  // }
  constructor({
    chains,
    options: _options,
  }: {
    chains?: Chain[];
    options?: BybitWalletConnectorOptions;
  } = {}) {
    const options = {
      name: _options?.name || "BybitWallet",
      // shimDisconnect: _options?.shimDisconnect ?? false,
      // shimChainChangedDisconnect: _options?.shimChainChangedDisconnect ?? true,
    };

    // console.log("bybit wallet", options);

    super({
      chains,
      options,
    });
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    // console.log("bybit wallet connect");

    try {
      const provider = await this.getProvider();
      // console.log(provider);
      if (!provider) throw new ConnectorNotFoundError();

      if (provider.on) {
        provider.on("accountsChanged", this.onAccountsChanged);
        provider.on("chainChanged", this.onChainChanged);
        provider.on("disconnect", this.onDisconnect);
      }

      this.emit("message", { type: "connecting" });

      // Attempt to show wallet select prompt with `wallet_requestPermissions` when
      // `shimDisconnect` is active and account is in disconnected state (flag in storage)
      let account: Address | null = null;
      if (!account) {
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        account = getAddress(accounts[0] as string);
      }

      // Switch to chain if provided
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported(id);
      }

      this.emit("connect", { account, chain: { id, unsupported } });
      return { account, chain: { id, unsupported }, provider };
    } catch (error) {
      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error as Error);
      if ((error as ProviderRpcError).code === -32002)
        throw new ResourceUnavailableRpcError(error as ProviderRpcError);
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async addChain() {
    throw new Error(
      "As a custodial wallet, it currently does not support adding other EVM chains through the user interface. At present, only the built-in public chain can be used."
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async getProvider() {
    return getBybitWalletProvider();
  }
}
