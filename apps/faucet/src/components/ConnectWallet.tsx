"use client";

import { useContext, useEffect, useRef } from "react";

import { useAccount, useConnect, useDisconnect, useNetwork } from "wagmi";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import { Button } from "@mantle/ui";
import { truncateAddress } from "@mantle/utils";

import { getAddress } from "ethers/lib/utils";
import StateContext from "@providers/stateContext";

function ConnectWallet() {
  // get the currently connected wallet-selected-chain
  const { chain: currentChain } = useNetwork();

  // unpack the context
  const { chainId, client, setClient, setWalletModalOpen, setMobileMenuOpen } =
    useContext(StateContext);

  // pick up connection details from wagmi
  const { address: wagmiAddress } = useAccount({
    onConnect: async () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await checkConnection();

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await changeAccount();
    },
  });

  // when disconnecting we want to retain control over whether or not to attempt a reconnect
  const reconnect = useRef(false);

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
    onSettled: async () => {},
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

  // Allow any chain — faucet only needs a connected address, not a specific network.
  useEffect(
    () => {
      if (!wagmiAddress && !currentChain) {
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
      {!!(client.isConnected && client.address) && (
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
      )}
      {
        // eslint-disable-next-line no-nested-ternary
        !client.address ? (
          <Button variant="walletConnect" size="regular" onClick={onConnect}>
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
        )
      }
    </div>
  );
}

export default ConnectWallet;
