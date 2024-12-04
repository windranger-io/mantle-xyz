"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { useAccount, useConnect, useDisconnect, useNetwork } from "wagmi";

import { CHAINS, L1_CHAIN_ID } from "@config/constants";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import { Button } from "@mantle/ui";
import { truncateAddress } from "@mantle/utils";

import { BiError } from "react-icons/bi";

import useIsChainID from "@hooks/useIsChainID";
import { useSwitchToNetwork } from "@hooks/useSwitchToNetwork";

import Link from "next/link";
import { getAddress } from "ethers/lib/utils";
import StateContext from "@providers/stateContext";

function ConnectWallet() {
  // get the currently connected wallet-selected-chain
  const { chain: currentChain } = useNetwork();

  // unpack the context
  const { chainId, client, setClient, setWalletModalOpen, setMobileMenuOpen } =
    useContext(StateContext);

  // check that we're connected to the appropriate chain
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<string>();

  // chain is valid if it matches any of these states...
  const isChainID = useMemo(() => {
    return currentChain && (isLayer1ChainID || !address);
  }, [currentChain, isLayer1ChainID, address]);

  // pick up connection details from wagmi
  const { address: wagmiAddress } = useAccount({
    onConnect: async () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await checkConnection();

      // auto-switch - ask the wallet to attempt to switch to chosen chain on first-connect
      if (!isChainID) {
        // await changeNetwork();
      }

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await changeAccount();
    },
  });

  // when disconnecting we want to retain control over whether or not to attempt a reconnect
  const reconnect = useRef(false);

  // pull to network method
  const { switchToNetwork } = useSwitchToNetwork();

  // control wagmi connector
  const { pendingConnector } = useConnect();

  const { disconnect, disconnectAsync } = useDisconnect({
    onMutate: () => {
      if (!reconnect.current && !client.address) {
        setClient({
          address: undefined,
          isConnected: false,
        });
      }
    },
    onSettled: async () => {
      // if (reconnect.current) {
      //   await new Promise((resolve) => {
      //     setTimeout(() => {
      //       resolve(connectAsync({ connector }).catch(() => null));
      //     }, 1000);
      //   });
      // }
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
        (!currentChain ||
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
        <Link
          href="https://app.mantle.xyz/bridge/history?network=sepolia"
          className="w-full"
          scroll
          shallow
        >
          <Button
            type="button"
            variant="walletLabel"
            size="regular"
            className="flex flex-row items-center text-xs h-full text-white gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 w-full justify-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Avatar walletAddress="address" />
            <div className="flex items-center justify-center gap-2">
              {truncateAddress(getAddress(client.address))}
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
              <Button
                variant="walletConnect"
                size="regular"
                onClick={onConnect}
              >
                Connect Wallet
              </Button>
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
