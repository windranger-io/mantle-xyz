"use client";

import { CHAINS } from "@config/constants";

export function useSwitchToNetwork() {
  // trigger addNetwork
  const addNetwork = async (chainId: number) => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    // add the woollyhat network to users wallet
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [CHAINS[chainId]],
    });
  };

  // trigger change of network
  const switchToNetwork = async (chainId: number): Promise<number | void> => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
      });
      return chainId;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError && switchError.code === 4902) {
        await addNetwork(chainId);
      } else {
        throw switchError;
      }
    }
    return Promise.resolve();
  };

  return {
    addNetwork,
    switchToNetwork,
  };
}
