import { Button } from "@mantle/ui";
import { useContext, useState, useEffect, useMemo, useCallback } from "react";

import StateContext from "@providers/stateContext";

import {
  Direction,
  CHAINS,
  Token,
  CTAPages,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
} from "@config/constants";

import { parseUnits } from "ethers/lib/utils.js";

import { useIsChainID } from "@hooks/web3/read/useIsChainID";
import { useCallApprove } from "@hooks/web3/bridge/write/useCallApprove";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";
import { useIsWalletMultisig } from "@hooks/useIsMultisigWallet";

// Contains a button & a modal to control allowance and deposits/withdrawals
export default function CTA({
  selected,
  direction,
  setIsOpen,
}: {
  selected: Token;
  direction: Direction;
  setIsOpen: (val: boolean) => void;
}) {
  // unpack the context
  const {
    chainId,
    client,
    provider,
    balances,
    allowance,
    selectedTokenAmount = "",
    destinationTokenAmount = "",
    setCTAPage,
    setWalletModalOpen,
  } = useContext(StateContext);

  // check that we're connected to the appropriate chain
  const isLayer1ChainID = useIsChainID(L1_CHAIN_ID);
  const isMantleChainID = useIsChainID(L2_CHAIN_ID);
  const isWalletMultisig = useIsWalletMultisig(
    provider,
    chainId,
    client.address
  );

  // set address with useState to avoid hydration errors
  const [address, setAddress] = useState<string>(client?.address!);

  // switch to the correct network if missing
  const { switchToNetwork } = useSwitchToNetwork();

  // check that the chainId is valid for the selected use-case
  const isChainID = useMemo(() => {
    return (
      (chainId === L1_CHAIN_ID && isLayer1ChainID) ||
      (chainId === L2_CHAIN_ID && isMantleChainID) ||
      !address
    );
  }, [address, chainId, isLayer1ChainID, isMantleChainID]);

  // create an allowance approval request on the selected token
  const { approve, approvalStatus } = useCallApprove(selected || {});

  // ensure we don't overflow
  const fixDecimals = useCallback(
    (value: string) => {
      const split = value.split(".");

      return parseUnits(
        `${split[0]}.${(split[1] || "0").substring(
          0,
          selected?.decimals || 18
        )}`,
        selected?.decimals || 18
      );
    },
    [selected]
  );

  // get the balance/allowanace details
  const spendDetails = useMemo(() => {
    return {
      balance: balances?.[selected?.address || ""] || "0",
      allowance,
    };
  }, [selected, balances, allowance]);

  // text should be indicative of the action
  const CTAButtonText = useMemo(() => {
    // console.log(spendDetails, destinationTokenAmount);
    let text;
    if (!client?.address) {
      text = "Please connect your wallet";
    } else if (!isChainID) {
      text = `Switch to ${CHAINS[chainId].chainName}`;
    } else if (
      destinationTokenAmount &&
      fixDecimals(spendDetails.balance || "0").lt(
        fixDecimals(destinationTokenAmount || "0")
      )
    ) {
      text = "Insufficient balance";
    } else if (
      fixDecimals(allowance || "-1").lt(
        fixDecimals(destinationTokenAmount || "0")
      )
    ) {
      // I'm not sure we need to have an allocation to withdraw assets...
      text = (
        <div className="flex flex-row gap-4 items-center mx-auto w-fit">
          <span>
            {approvalStatus ||
              `Allocate allowance before ${
                direction === Direction.Deposit ? "depositing" : "withdrawing"
              } assets`}
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
    } else if (direction === Direction.Deposit) {
      text = "Deposit Tokens to L2";
    } else {
      text = "Withdraw Tokens from L2";
    }

    return text;
  }, [
    spendDetails.balance,
    allowance,
    destinationTokenAmount,
    client?.address,
    isChainID,
    direction,
    chainId,
    approvalStatus,
    fixDecimals,
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
      {!client?.address ? (
        <div>
          <Button
            type="button"
            size="full"
            className="h-14"
            onClick={() => setWalletModalOpen(true)}
          >
            Please connect your wallet
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="full"
          className="h-14"
          onClick={() => {
            if (!isChainID) {
              switchToNetwork(chainId);
            } else if (
              fixDecimals(allowance || "-1").lt(
                fixDecimals(destinationTokenAmount || "0")
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
            (isChainID &&
              !!client.address &&
              (!!approvalStatus ||
                !destinationTokenAmount ||
                !selectedTokenAmount ||
                !parseFloat(destinationTokenAmount) ||
                Number.isNaN(parseFloat(destinationTokenAmount)) ||
                Number.isNaN(parseFloat(selectedTokenAmount)) ||
                fixDecimals(spendDetails.balance || "-1").lt(
                  fixDecimals(destinationTokenAmount || "0")
                ))) ||
            isWalletMultisig
          }
        >
          {CTAButtonText}
        </Button>
      )}

      {/* <hr className="border border-stroke-inputs mt-6 mb-8" /> */}
      {isChainID &&
        !!client.address &&
        fixDecimals(balances[selected.address] || "-1").gte(
          fixDecimals(destinationTokenAmount || "0")
        ) &&
        fixDecimals(allowance || "-1").gte(
          fixDecimals(destinationTokenAmount || "0")
        ) &&
        destinationTokenAmount && <div className="my-8" />}
    </div>
  );
}
