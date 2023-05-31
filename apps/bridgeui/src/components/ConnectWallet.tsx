"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";

import StateContext from "@providers/stateContext";

import { useAccount, useConnect, useDisconnect, useNetwork } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import { truncateAddress } from "@utils/formatStrings";
import { CHAINS, Views } from "@config/constants";

import Avatar from "@mantle/ui/src/presentational/Avatar";
import { Button } from "@mantle/ui";
import { BiError } from "react-icons/bi";

import { useIsChainID } from "@hooks/useIsChainID";
import { useSwitchToNetwork } from "@hooks/useSwitchToNetwork";

function ConnectWallet() {
  // get the currently connected wallet-selected-chain
  const { chain: currentChain } = useNetwork();

  // unpack the context
  const { chainId, client, safeChains, setClient, setView } =
    useContext(StateContext);

  // check that we're connected to the appropriate chain
  const isGoerliChainID = useIsChainID(5);
  const isMantleChainID = useIsChainID(5001);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>();

  // chain is valid if it matches any of these states...
  const isChainID = useMemo(() => {
    return (
      currentChain &&
      ((safeChains.length === 2 &&
        safeChains.indexOf(currentChain.id) !== -1) ||
        (chainId === 5 && isGoerliChainID) ||
        (chainId === 5001 && isMantleChainID) ||
        !address)
    );
  }, [
    safeChains,
    currentChain,
    chainId,
    isGoerliChainID,
    isMantleChainID,
    address,
  ]);

  // when disconnecting we want to retain control over whether or not to attempt a reconnect
  const reconnect = useRef(false);

  // pull to network method
  const { switchToNetwork } = useSwitchToNetwork();

  // control wagmi connector
  const { connect, connectAsync } = useConnect({
    connector: new InjectedConnector(),
  });

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
            resolve(connectAsync().catch(() => null));
          }, 1000);
        });
      }
    },
  });

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

  // trigger change of network
  const changeNetwork = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    // trigger a change of network
    await switchToNetwork(chainId);
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

      // auto-switch - ask the wallet to attempt to switch to chosen chain on first-connect
      if (!isChainID) {
        // await changeNetwork();
      }

      await changeAccount();
    },
  });

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

  // return connect/disconnect component
  return (
    <div className="flex flex-row gap-4">
      {isChainID && client.isConnected && client.address ? (
        <Button
          type="button"
          variant="walletConnect"
          size="regular"
          className="flex flex-row items-center gap-2 backdrop-blur-[50px] bg-white/10 hover:bg-white/20 w-fit cursor-pointer"
          onClick={() => {
            // router.push("/transactions")
            setView(Views.Transactions);
          }}
        >
          <Avatar walletAddress="address" />
          <p className="text-white ">{truncateAddress(client.address)}</p>
        </Button>
      ) : (
        ``
      )}
      {
        // eslint-disable-next-line no-nested-ternary
        isChainID || !client.address ? (
          <>
            <Button
              variant="walletConnect"
              size="regular"
              onClick={() => {
                if (!client.address) {
                  connect();
                } else {
                  // clear the client before calling disconnect
                  client.address = undefined;
                  // disconnect
                  disconnect();
                }
              }}
            >
              {!client.address ? `Connect Wallet` : `Disconnect`}
            </Button>
            {/* <button
              type="button"
              className="text-white"
              onClick={() => (!address ? connect() : disconnect())}
            >
              {!address ? `Connect Wallet` : `[disconnect]`}
            </button> */}
          </>
        ) : !isChainID ? (
          <div className="flex flex-row items-center gap-4 justify-end">
            <div
              className="flex flex-row items-center gap-2 text-status-error
            h-fit  rounded-lg text-xs backdrop-blur-[50px] bg-white/10 w-fit px-4 py-2
            "
            >
              <BiError className="text-sm" />
              <p className="text-sm">Unsupported chain</p>
            </div>
            <Button
              className="max-w-[10em]"
              variant="walletConnect"
              onClick={() => changeNetwork()}
            >
              Please switch to {CHAINS[chainId].chainName}
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
