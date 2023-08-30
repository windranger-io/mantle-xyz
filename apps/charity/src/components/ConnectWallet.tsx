/* eslint-disable @typescript-eslint/no-use-before-define */

"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import StateContext from "@providers/stateContext";

import { useAccount, useConnect, useDisconnect, useNetwork } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { CHAINS, L1_CHAIN_ID } from "@config/constants";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import { Button } from "@mantle/ui";
import { truncateAddress } from "@mantle/utils";

import { BiError } from "react-icons/bi";

import { useIsChainID } from "@hooks/web3/read/useIsChainID";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";

import { getAddress } from "ethers/lib/utils";

function ConnectWallet() {
  // get the currently connected wallet-selected-chain
  const { chain: currentChain } = useNetwork();

  // unpack the context
  const {
    chainId,
    client,
    safeChains,
    setClient,
    setWalletModalOpen,
    setMobileMenuOpen,
  } = useContext(StateContext);

  // check that we're connected to the appropriate chain
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>();

  // chain is valid if it matches any of these states...
  const isChainID = useMemo(() => {
    return (
      currentChain &&
      ((safeChains.length === 2 &&
        safeChains.indexOf(currentChain.id) !== -1) ||
        (chainId === L1_CHAIN_ID && isLayer1ChainID) ||
        !address)
    );
  }, [safeChains, currentChain, chainId, isLayer1ChainID, address]);

  // when disconnecting we want to retain control over whether or not to attempt a reconnect
  const reconnect = useRef(false);

  // pull to network method
  const { switchToNetwork } = useSwitchToNetwork();

  // control wagmi connector
  const { connectAsync, connectors, pendingConnector } = useConnect();

  // Find the right connector by ID
  const connector = useMemo(
    // we can allow this connection.id to be set in connection modal phase
    () =>
      connectors.find((conn) => conn.id === "metamask") ||
      // fallback to injected provider
      new InjectedConnector(),
    [connectors]
  );

  const { disconnect, disconnectAsync } = useDisconnect({
    onMutate: () => {
      if (!reconnect.current && !client.address) {
        setClient({
          isConnected: false,
        });
      }
    },
    onSettled: async () => {
      if (reconnect.current) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(connectAsync({ connector }).catch(() => null));
          }, 1000);
        });
      }
    },
  });

  // pick up connection details from wagmi
  const { address: wagmiAddress } = useAccount({
    onConnect: async () => {
      await checkConnection();

      // auto-switch - ask the wallet to attempt to switch to chosen chain on first-connect
      if (!isChainID) {
        // await changeNetwork();
      }

      await changeAccount();
    },
  });

  // record change of account
  const changeAccount = async () => {
    setClient({
      chainId,
      isConnected: true,
      address: wagmiAddress,
      connector: client?.connector || pendingConnector?.id,
    });
  };

  // trigger change of network
  const changeNetwork = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    // trigger a change of network
    await switchToNetwork(chainId);
  };

  // check the connection is valid
  const checkConnection = async () => {
    if (wagmiAddress) {
      setClient({
        isConnected: true,
        address: wagmiAddress,
        connector: client?.connector,
      });
    } else {
      setClient({
        isConnected: false,
      });
    }
  };

  // set wagmi address to address for ssr
  useEffect(() => {
    if (!reconnect.current || wagmiAddress) {
      setAddress(wagmiAddress);
    }
  }, [reconnect, wagmiAddress]);

  // if the current chain doesnt match the selected chain, we can trigger a reconnect to correct state and to connect to the user to the site again
  useEffect(
    () => {
      if (
        !wagmiAddress &&
        ((!currentChain && client.isConnected) ||
          (client.chainId && currentChain?.id !== client.chainId))
      ) {
        reconnect.current = true;
        disconnectAsync().then(() => {
          reconnect.current = false;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentChain]
  );

  const onConnect = () => {
    setWalletModalOpen(true);
    setMobileMenuOpen(false);
  };

  // return connect/disconnect component
  return (
    <div className="flex flex-row gap-4 w-full">
      {isChainID && client.isConnected && client.address ? (
        <Link href="/account/migrate" scroll shallow>
          <Button
            type="button"
            size="regular"
            variant="walletLabel"
            className="flex items-center text-xs text-white gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 justify-center w-full h-full"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Avatar walletAddress="address" />
            <div className="flex items-center justify-center gap-2">
              {truncateAddress(getAddress(client.address) as `0x${string}`)}
            </div>
          </Button>
        </Link>
      ) : (
        ``
      )}
      {
        // eslint-disable-next-line no-nested-ternary
        isChainID || !client.address ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {!client.address ? (
              <div>
                <Button
                  variant="walletConnect"
                  size="regular"
                  onClick={onConnect}
                >
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <Button
                variant="walletConnect"
                size="regular"
                onClick={() => {
                  // clear the client before calling disconnect
                  client.address = undefined;
                  // disconnect
                  disconnect();
                  setMobileMenuOpen(false);
                }}
              >
                Disconnect
              </Button>
            )}
          </>
        ) : !isChainID ? (
          <div className="grid grid-cols-2 items-center gap-4 w-full">
            <div className="flex flex-row items-center gap-2 text-status-error h-full rounded-lg text-xs backdrop-blur-[50px] bg-white/10 justify-center px-4 py-2 whitespace-nowrap">
              <BiError className="text-sm" />
              <p className="text-sm whitespace-normal text-center">
                Unsupported chain
              </p>
            </div>
            <Button
              variant="walletConnect"
              onClick={() => changeNetwork()}
              className="xl:whitespace-nowrap h-full"
            >
              Switch to {CHAINS[chainId].chainName}
            </Button>
          </div>
        ) : (
          <div>Loading...</div>
        )
      }
    </div>
  );
}

export default ConnectWallet;
