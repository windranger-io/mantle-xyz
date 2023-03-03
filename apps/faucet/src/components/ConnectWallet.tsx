"use client";

import { useEffect, useState } from "react";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { truncateAddress } from "@utils/truncateAddress";
import { CHAINS, CHAIN_ID } from "@config/constants";

import useIsMounted from "@hooks/useIsMounted";
import useIsChainID from "@hooks/useIsChainID";

function ConnectWallet() {
  // only render when mounted
  const isMounted = useIsMounted();
  // check that we're connected to the appropriate chain
  const isChainID = useIsChainID(CHAIN_ID);
  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>();
  // keep hold of all connection details
  const [client, setClient] = useState<{
    isConnected: boolean;
    chainId?: number;
    address?: `0x${string}`;
  }>({
    isConnected: false,
  });

  // control wagmi connector
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  // record change of account
  const changeAccount = async () => {
    const accounts = await window.ethereum?.request({
      method: "eth_requestAccounts",
    });

    if (accounts) {
      setClient({
        chainId: parseInt(
          (await window.ethereum?.request({
            method: "eth_chainId",
          })) || "-1",
          16
        ),
        isConnected: true,
        address: accounts[0],
      });
    }
  };

  // record change of network
  const changeNetwork = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(CHAIN_ID).toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError && switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [CHAINS[CHAIN_ID]],
        });
      }
    } finally {
      changeAccount();
    }
  };

  // check the connection is valid
  const checkConnection = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setClient({
          isConnected: true,
          address: accounts[0],
        });
      } else {
        setClient({
          isConnected: false,
        });
      }
    }
  };

  // pick up connection details from wagmi
  const { address: wagmiAddress } = useAccount({
    onConnect: async () => {
      await checkConnection();

      // auto-switch - ask the wallet to attempt to switch to goerli on first-connect
      if (!isChainID) {
        // await changeNetwork();
      }

      await changeAccount();
    },
  });

  // set wagmi address to address for ssr
  useEffect(() => {
    setAddress(wagmiAddress);
  }, [wagmiAddress]);

  // return connect/disconnect component
  return isMounted() ? (
    <div className="mt-8">
      {address && isChainID && client.isConnected ? (
        <>Connected to {truncateAddress(address)}</>
      ) : (
        ``
      )}
      {
        // eslint-disable-next-line no-nested-ternary
        isChainID || !address ? (
          <>
            {address ? " - " : ""}
            <button
              type="button"
              onClick={() => (!address ? connect() : disconnect())}
            >
              {!address ? `Connect Wallet` : `[disconnect]`}
            </button>
          </>
        ) : !isChainID ? (
          <div>
            Unsupported chain -{" "}
            <button type="button" onClick={() => changeNetwork()}>
              please switch to Goerli
            </button>
          </div>
        ) : (
          <div>Loading...</div>
        )
      }
    </div>
  ) : (
    <div />
  );
}

export default ConnectWallet;
