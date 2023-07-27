"use client";

import { CHAINS } from "@config/constants";
import { useToast } from "@hooks/useToast";
import { useEffect, useState } from "react";

import { useSwitchNetwork } from "wagmi";

declare global {
  interface Window {
    ethereum: import("ethers").providers.ExternalProvider;
  }
}

export function useSwitchToNetwork() {
  // allow wagmi to attempt to switch networks
  const { switchNetwork, error } = useSwitchNetwork();

  // set the given error into context to control dismissals
  const [displayError, setDisplayError] = useState("");

  // create an error toast if required
  const { updateToast } = useToast();

  // trigger addNetwork
  const addNetwork = async (chainId: number) => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    // add the woollyhat network to users wallet
    await window.ethereum.request?.({
      method: "wallet_addEthereumChain",
      params: [CHAINS[chainId]],
    });
  };

  // trigger change of network
  const switchToNetwork = async (chainId: number): Promise<number | void> => {
    // perform switch with wagmi
    try {
      // reset prev error
      setDisplayError("");
      // attempt to switch the network
      switchNetwork?.(chainId);
      // on success return the chainID we moved to
      return chainId;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError && switchError.code === 4902) {
        await addNetwork(chainId);
      } else if (switchError.code !== -32000) {
        updateToast({
          id: "switch-error",
          content: "Error: Unable to switch chains",
          type: "error",
          borderLeft: "red-600",
        });
      }
    }
    return Promise.resolve();
  };

  // hydrate error
  useEffect(() => {
    setDisplayError(error?.toString() || "");
  }, [error]);

  // place toast on error
  useEffect(
    () => {
      if (displayError) {
        updateToast({
          id: "switch-error",
          content: "Error: Unable to switch chains",
          type: "error",
          borderLeft: "red-600",
          buttonText: "Close",
          onButtonClick: () => {
            setDisplayError("");
            return true;
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayError]
  );

  return {
    addNetwork,
    switchToNetwork,
  };
}
