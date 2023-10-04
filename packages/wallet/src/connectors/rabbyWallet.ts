import { ExternalProvider } from "@ethersproject/providers";
import type { Chain } from "viem/chains";

import { WindowProvider } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export type InjectedConnectorOptions = {
  name?: string | ((detectedName: string | string[]) => string);
};

export type RabbyWalletConnectorOptions = InjectedConnectorOptions;
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

export class RabbyWalletConnector extends InjectedConnector {
  readonly id = "rabbyWallet";

  readonly name = "Rabby Wallet";

  readonly ready =
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    (window.ethereum as ExternalProvider & { isRabby: boolean }).isRabby;

  constructor({
    chains,
  }: {
    chains?: Chain[];
  } = {}) {
    const options = {
      name: "Rabby Wallet",
    };
    super({ chains, options });
  }

  // eslint-disable-next-line class-methods-use-this
  async getProvider() {
    const { ethereum } = window as unknown as {
      ethereum: WindowProvider;
    };
    if (ethereum?.isRabby) {
      return ethereum;
    }
    return undefined;
  }
}
