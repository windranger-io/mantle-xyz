import { Button } from "@mantle/ui";
import { useContext, useState, useEffect, useMemo } from "react";

import StateContext from "@providers/stateContext";

import {
  CHAINS,
  CTAPages,
  L1_CHAIN_ID,
  L1_BITDAO_TOKEN_ADDRESS,
  L1_BITDAO_TOKEN,
} from "@config/constants";

import { useConnect } from "wagmi";
import { parseUnits } from "ethers/lib/utils.js";
import { InjectedConnector } from "wagmi/connectors/injected";

import { useIsChainID } from "@hooks/web3/read/useIsChainID";
// import { useCallApprove } from "@hooks/web3/bridge/write/useCallApprove";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";
import { useCallApprove } from "@hooks/web3/converter/write/useCallApprove";

// Contains a button & a modal to control allowance and deposits/withdrawals
export default function CTA({
  setIsOpen,
}: {
  setIsOpen: (val: boolean) => void;
}) {
  // unpack the context
  const {
    chainId,
    client,
    balances,
    allowance,
    amount = "",
    setCTAPage,
  } = useContext(StateContext);

  // control wagmi connector
  const { connect, connectors } = useConnect();

  // Find the right connector by ID
  const connector = useMemo(
    // we can allow this connection.id to be set in connection modal phase
    () =>
      connectors.find((conn) => conn.id === "metamask") ||
      // fallback to injected provider
      new InjectedConnector(),
    [connectors]
  );

  // check that we're connected to the appropriate chain
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<`0x${string}`>(client?.address!);

  // switch to the correct network if missing
  const { switchToNetwork } = useSwitchToNetwork();

  // check that the chainId is valid for the selected use-case
  const isChainID = useMemo(() => {
    return (chainId === L1_CHAIN_ID && isLayer1ChainID) || !address;
  }, [address, chainId, isLayer1ChainID]);

  // create an allowance approval request on the selected token
  const { approve, approvalStatus } = useCallApprove();

  // get the balance/allowanace details
  const spendDetails = useMemo(() => {
    return {
      balance: balances?.[L1_BITDAO_TOKEN_ADDRESS] || "0",
      allowance,
    };
  }, [balances, allowance]);

  // text should be indicative of the action
  const CTAButtonText = useMemo(() => {
    // console.log(spendDetails, destinationTokenAmount);
    let text;
    if (!client?.address) {
      text = "Connect wallet";
    } else if (!isChainID) {
      text = `Switch to ${CHAINS[chainId].chainName}`;
    } else if (
      amount &&
      parseUnits(
        parseFloat(spendDetails.balance || "0") > 0
          ? spendDetails.balance
          : "-1",
        L1_BITDAO_TOKEN.decimals
      ).lt(parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals))
    ) {
      text = "Insufficient balance";
    } else if (
      parseUnits(allowance || "-1", L1_BITDAO_TOKEN.decimals).lt(
        parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals)
      )
    ) {
      text = (
        <div className="flex flex-row gap-4 items-center mx-auto w-fit">
          <span>
            {approvalStatus || `Allocate allowance before converting $BIT`}
          </span>
          {approvalStatus ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            ""
          )}
        </div>
      );
    } else {
      text = "Convert $BIT to $MNT";
    }

    return text;
  }, [
    client?.address,
    isChainID,
    amount,
    spendDetails.balance,
    allowance,
    chainId,
    approvalStatus,
  ]);

  // set wagmi address to address for ssr
  useEffect(() => {
    if (client?.address && client?.address !== address) {
      setAddress(client?.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.address]);

  return (
    <div className="mt-4">
      <Button
        type="button"
        size="full"
        className="h-14"
        onClick={() => {
          if (!client?.address) {
            connect({
              connector,
            });
          } else if (!isChainID) {
            switchToNetwork(chainId);
          } else if (
            parseUnits(allowance || "-1", L1_BITDAO_TOKEN.decimals).lt(
              parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals)
            )
          ) {
            // allocate allowance
            approve();
          } else {
            // always from the default page
            setCTAPage(CTAPages.Default);
            // complete the transaction inside the modal
            setIsOpen(true);
          }
        }}
        disabled={
          isChainID &&
          !!client.address &&
          (!!approvalStatus ||
            !amount ||
            !parseFloat(amount) ||
            Number.isNaN(parseFloat(amount)) ||
            parseUnits(
              spendDetails.balance || "-1",
              L1_BITDAO_TOKEN.decimals
            ).lt(parseUnits(amount || "0", L1_BITDAO_TOKEN.decimals)))
        }
      >
        {CTAButtonText}
      </Button>
    </div>
  );
}
