"use client";

import { ABSOLUTE_PATH, Token } from "@config/constants";

export function useAddToken() {
  // trigger change of network
  const addToken = async (token: Token) => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    return window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: token.address, // The address that the token is at.
          symbol: token.symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: token.decimals, // The number of decimals in the token
          image:
            token.logoURI.indexOf("http") === 0
              ? token.logoURI
              : ABSOLUTE_PATH + token.logoURI, // A string url of the token logo
        },
      },
    });
  };

  return {
    addToken,
  };
}
