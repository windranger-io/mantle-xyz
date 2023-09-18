import { ExternalProvider } from "@ethersproject/providers";
import type { Chain } from "viem/chains";

import { WindowProvider } from "wagmi";
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

export class TokenPocketConnector extends InjectedConnector {
  readonly id = "tokenPocket";

  readonly name = "TokenPocket";

  readonly ready =
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    (window.ethereum as ExternalProvider & { isTokenPocket: boolean })
      .isTokenPocket;
  // readonly ready =
  //   typeof window !== "undefined" && typeof window.bitkeep !== "undefined";
  // provider?: Window["bitkeep"];

  constructor({
    chains,
  }: {
    chains?: Chain[];
  } = {}) {
    const options = {
      name: "TokenPocket",
    };
    super({ chains, options });
  }

  // eslint-disable-next-line class-methods-use-this
  async getProvider() {
    const { ethereum } = window as unknown as {
      ethereum: WindowProvider;
    };
    if (ethereum?.isTokenPocket) {
      return ethereum;
    }
    return undefined;
  }
}
