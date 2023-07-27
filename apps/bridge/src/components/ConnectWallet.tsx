"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";

import StateContext from "@providers/stateContext";

import { useAccount, useConnect, useDisconnect, useNetwork } from "wagmi";

import { CHAINS, L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import { ArrowDownIcon, Button, WalletModal } from "@mantle/ui";
import { truncateAddress } from "@mantle/utils";

import { BiError } from "react-icons/bi";

import { useIsChainID } from "@hooks/web3/read/useIsChainID";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";
import { getAddress } from "ethers/lib/utils";
import { usePathname, useRouter } from "next/navigation";

function ConnectWallet() {
  // get the currently connected wallet-selected-chain
  const { chain: currentChain } = useNetwork();

  // unpack the context
  const { chainId, client, safeChains, setClient } = useContext(StateContext);

  // check that we're connected to the appropriate chain
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);
  const isMantleChainID = useIsChainID(L2_CHAIN_ID);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<string>();

  // chain is valid if it matches any of these states...
  const isChainID = useMemo(() => {
    return (
      currentChain &&
      ((safeChains.length === 2 &&
        safeChains.indexOf(currentChain.id) !== -1) ||
        (chainId === L1_CHAIN_ID && isLayer1ChainID) ||
        (chainId === L2_CHAIN_ID && isMantleChainID) ||
        !address)
    );
  }, [
    safeChains,
    currentChain,
    chainId,
    isLayer1ChainID,
    isMantleChainID,
    address,
  ]);

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
  const { connect, connectors, pendingConnector } = useConnect();

  const { disconnect, disconnectAsync } = useDisconnect({
    onMutate: () => {
      if (!reconnect.current && !client.address) {
        setClient({
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

  const router = useRouter();
  const pathName = usePathname();

  const handleAccountClicked = () => {
    router.push(
      pathName?.indexOf("/withdraw") !== -1
        ? "/account/withdraw"
        : "/account/deposit"
    );
    // TODO: close mobile modal if any
  };

  // return connect/disconnect component
  return (
    <div className="flex flex-row gap-4 w-full">
      {isChainID && client.isConnected && client.address ? (
        <Button
          type="button"
          variant="walletLabel"
          size="regular"
          onClick={handleAccountClicked}
          className="flex flex-row items-center text-xs h-full text-white gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 justify-center w-full"
        >
          <Avatar walletAddress="address" />
          <div className="flex items-center justify-center gap-2">
            {truncateAddress(getAddress(client.address))}
            <ArrowDownIcon className="w-3.5 h-3.5" />
          </div>
        </Button>
      ) : (
        ``
      )}
      {
        // eslint-disable-next-line no-nested-ternary
        isChainID || !client.address ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {!client.address ? (
              <WalletModal
                onMetamask={() => {
                  setClient({
                    ...client,
                    connector: "metaMask",
                  });
                  connect({
                    connector: connectors.find(
                      (conn) => conn.id === "metaMask"
                    ),
                  });
                }}
                onWalletConnect={() => {
                  setClient({
                    ...client,
                    connector: "walletConnect",
                  });
                  connect({
                    chainId,
                    connector: connectors.find(
                      (conn) => conn.id === "walletConnect"
                    ),
                  });
                }}
              >
                <div>
                  <Button variant="walletConnect" size="regular">
                    Connect Wallet
                  </Button>
                </div>
              </WalletModal>
            ) : (
              <Button
                variant="walletConnect"
                size="regular"
                onClick={() => {
                  // clear the client before calling disconnect
                  client.address = undefined;
                  // disconnect
                  disconnect();
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
