import {
  ProviderRpcError,
  ResourceUnavailableRpcError,
  SwitchChainError,
  UserRejectedRequestError,
  getAddress,
  numberToHex,
  type Address,
} from "viem";
import type { Chain } from "viem/chains";

import { ConnectorNotFoundError, WindowProvider } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ChainNotConfiguredForConnectorError } from "./errors";
import { normalizeChainId } from "./utils";

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
    bitkeep?: { ethereum: WindowProvider } & { isBybit: boolean };
  }
}

export function getBitgetWalletProvider(): WindowProvider | undefined {
  const isWallet = (bitkeep: NonNullable<Window["bitkeep"]>) => {
    // Identify if Trust Wallet injected provider is present.
    const provider = !!bitkeep.isBybit;

    return provider;
  };

  const injectedProviderExist =
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    typeof window.bitkeep !== "undefined";

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  // Trust Wallet was injected into window.ethereum.
  if (isWallet(window.bitkeep as NonNullable<Window["bitkeep"]>)) {
    return window.bitkeep?.ethereum;
  }

  // Trust Wallet provider might be replaced by another
  // injected provider, check the providers array.
  // if (window.ethereum?.providers) {
  //   return window.ethereum.providers.find(isWallet)
  // }

  // In some cases injected providers can replace window.ethereum
  // without updating the providers array. In those instances the Trust Wallet
  // can be installed and its provider instance can be retrieved by
  // looking at the global `trustwallet` object.
  return window.bitkeep?.ethereum;
}
export class BitgetWalletConnector extends InjectedConnector {
  readonly id = "bitgetWallet";
  readonly name = "Bitget Wallet";
  readonly ready =
    typeof window !== "undefined" && typeof window.bitkeep !== "undefined";
  provider?: Window["bitkeep"];

  constructor({
    chains,
    options: _options,
  }: {
    chains?: Chain[];
    options?: BybitWalletConnectorOptions;
  } = {}) {
    const options = {
      name: _options?.name || "BitgetWallet",
      // shimDisconnect: _options?.shimDisconnect ?? false,
      // shimChainChangedDisconnect: _options?.shimChainChangedDisconnect ?? true,
    };

    super({
      chains,
      options,
    });
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider();

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

  protected onChainChanged = (chainId: number | string) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  };
  async addChain(chain: Chain) {
    throw new Error(
      "As a custodial wallet, it currently does not support adding other EVM chains through the user interface. At present, only the built-in public chain can be used."
    );
  }
  // async switchChain(chainId: number):Promise<Chain> {
  //   console.log("switch", chainId);
  //   const id = normalizeChainId(chainId);
  //   const unsupported = this.isChainUnsupported(id);
  //   this.emit("change", { chain: { id, unsupported } });
  //   return id
  //   // return await this.switchChain(chainId);
  // }

  async switchChain(chainId: number): Promise<Chain> {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const idHex = numberToHex(chainId);

    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });

    try {
      await Promise.all([
        provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: idHex }],
        }),
        new Promise<void>((res) =>
          this.on("change", ({ chain }) => {
            if (chain?.id === chainId) res();
          })
        ),
      ]);
      return (
        this.chains.find((x) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { name: "Ether", decimals: 18, symbol: "ETH" },
          rpcUrls: { default: { http: [""] }, public: { http: [""] } },
        }
      );
    } catch (error) {
      const chain = this.chains.find((x) => x.id === chainId);
      if (!chain)
        throw new ChainNotConfiguredForConnectorError({
          chainId,
          connectorId: this.id,
        });

      // Indicates chain is not added to provider
      if (
        (error as ProviderRpcError).code === 4902 ||
        // Unwrapping for MetaMask Mobile
        // https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719
        (error as ProviderRpcError<{ originalError?: { code: number } }>)?.data
          ?.originalError?.code === 4902
      ) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: idHex,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls.public?.http[0] ?? ""],
                blockExplorerUrls: this.getBlockExplorerUrls(chain),
              },
            ],
          });

          const currentChainId = await this.getChainId();
          if (currentChainId !== chainId)
            throw new UserRejectedRequestError(
              new Error("User rejected switch after adding network.")
            );

          return chain;
        } catch (error) {
          throw new UserRejectedRequestError(error as Error);
        }
      }

      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error as Error);
      throw new SwitchChainError(error as Error);
    }
  }

  async getProvider() {
    return getBitgetWalletProvider();
  }
}
