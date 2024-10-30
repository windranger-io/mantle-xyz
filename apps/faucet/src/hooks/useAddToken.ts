"use client";

declare global {
  interface Window {
    ethereum: import("ethers").providers.ExternalProvider;
  }
}

export function useAddToken() {
  // trigger change of network
  const addToken = async (token: any) => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    return window.ethereum?.request?.({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: token.address, // The address that the token is at.
          symbol: token.symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: token.decimals, // The number of decimals in the token
          image: token.imageUrl,
        },
      } as any,
    });
  };

  return {
    addToken,
  };
}
