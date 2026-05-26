"use client";

import { useContext, useEffect, useRef, useState } from "react";

import { useAccount, useConnections, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import { Button } from "@mantle/ui";
import { truncateAddress } from "@mantle/utils";

import { getAddress } from "ethers/lib/utils";
import StateContext from "@providers/stateContext";
import useAccountConnectionEffect from "@hooks/useAccountConnectionEffect";

function ConnectWallet() {
  // pick up connection details from wagmi
  const { address: wagmiAddress, chain: currentChain } = useAccount();

  // unpack the context
  const { client, setClient, setMobileMenuOpen } = useContext(StateContext);

  // when disconnecting we want to retain control over whether or not to attempt a reconnect
  const reconnect = useRef(false);

  const { disconnect, disconnectAsync } = useDisconnect();
  const connections = useConnections();

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}` | undefined>();

  useAccountConnectionEffect({
    onConnect({ address: onConnectAddress, chainId: onConnectChainId }) {
      setClient({
        chainId: onConnectChainId,
        isConnected: true,
        address: onConnectAddress,
      });
    },
    onDisconnect() {
      connections.forEach(({ connector }) => {
        disconnect({ connector });
      });
      setClient({
        isConnected: false,
      });
    },
  });

  // hydrate the address client-side to avoid SSR mismatch
  useEffect(() => {
    if (!reconnect.current || wagmiAddress) {
      setAddress(wagmiAddress);
    }
  }, [wagmiAddress]);

  // faucet supports any chain in SUPPORTED_CHAIN_IDS — just keep the connection
  // healthy after a chain switch; never force a disconnect unless wagmi already
  // dropped the connection.
  useEffect(
    () => {
      if (!wagmiAddress && client.isConnected && !currentChain) {
        reconnect.current = true;
        disconnectAsync().then(() => {
          reconnect.current = false;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentChain]
  );

  const { openConnectModal } = useConnectModal();

  const onConnect = () => {
    openConnectModal?.();
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-row gap-4 w-full">
      {!!(client.isConnected && client.address && address) && (
        <Button
          type="button"
          variant="walletLabel"
          size="regular"
          className="flex flex-row items-center text-xs h-full text-white gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 w-full justify-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Avatar walletAddress="address" />
          <div className="flex items-center justify-center gap-2">
            {truncateAddress(getAddress(client.address) as `0x${string}`)}
          </div>
        </Button>
      )}
      {!client.address ? (
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
      )}
    </div>
  );
}

export default ConnectWallet;
