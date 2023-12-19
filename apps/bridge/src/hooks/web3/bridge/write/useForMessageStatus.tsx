"use client";

/* eslint-disable no-await-in-loop */
import { MessageLike, MessageStatus } from "@ethan-bedrock/sdk";

import { useContext, useState } from "react";
import StateContext from "@providers/stateContext";

import { L1_CHAIN_ID, L2_CHAIN_ID, WithdrawStatus } from "@config/constants";
import { useMantleSDK } from "@providers/mantleSDKContext";

// Captures a snapshot of the state and waits for the bridge message to complete on the other side
export function useForMessageStatus() {
  const { setSafeChains, setCTAStatus, setWithdrawStatus } =
    useContext(StateContext);

  const { getMessageStatus } = useMantleSDK();
  const [stopped, setStopped] = useState(false);

  const waitForMessageStatus = async (txHash: MessageLike): Promise<void> => {
    let iterations = 0;
    // wait for 1 min before we start checking
    // await timeout(60000);
    while (!stopped && iterations < 2000) {
      const status = await getMessageStatus!(txHash);
      console.log("------------status------------", status);
      if (status === MessageStatus.READY_TO_PROVE) {
        setCTAStatus(
          "Mantle v2 need to prove the withdraw message, waiting for status READY_TO_PROVE..."
        );
        setWithdrawStatus(WithdrawStatus.READY_TO_PROVE);
        // TODO: set safeChains until we complete this tx because we'll be in a valid state on either chain
        setSafeChains([L1_CHAIN_ID, L2_CHAIN_ID]);
      } else if (status === MessageStatus.IN_CHALLENGE_PERIOD) {
        // based on the status update the states status and wait for the relayed message before setting the L1 txHash
        setCTAStatus(
          "In the challenge period, waiting for status READY_FOR_RELAY..."
        );
        setWithdrawStatus(WithdrawStatus.IN_CHALLENGE_PERIOD);
      } else if (status === MessageStatus.READY_FOR_RELAY) {
        setCTAStatus("Ready for relay, finalizing message now");
        setWithdrawStatus(WithdrawStatus.READY_FOR_RELAY);
      } else if (status === MessageStatus.RELAYED) {
        setCTAStatus("RELAYED");
        setWithdrawStatus(WithdrawStatus.RELAYED);
        setStopped(true);
      }
      // 12s is approx time it takes to mine a block (wait 3 blocks before checking again)
      // await timeout(36000);
      iterations += 1;
    }
  };

  return {
    stopped,
    setStopped,
    waitForMessageStatus,
  };
}
