"use client";

import {
  L1_BITDAO_TOKEN_ADDRESS,
  L1_CHAIN_ID,
  L1_CONVERTER_V2_CONTRACT_ADDRESS,
  TOKEN_ABI,
} from "@config/constants";
import StateContext from "@providers/stateContext";
import { Contract, Event as EthEvent } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useContext, useEffect, useState } from "react";
import TxLink from "./utils/TxLink";

export default function List() {
  const { provider } = useContext(StateContext);
  const [approvals, setApprovals] = useState<Array<EthEvent>>();
  async function GetPastEvents(contract: Contract) {
    if (!contract) return;
    const filter = contract.filters.Approval(
      null,
      L1_CONVERTER_V2_CONTRACT_ADDRESS
    );
    const logsTo = await contract.queryFilter(filter, -10000, "latest");

    setApprovals(logsTo);
    // contract.on("Approval", (spender, amount) => {
    //   let transferEvent = {
    //     spender: spender,

    //     amount: amount,
    //     // eventData: event,
    //   };
    //   console.log(JSON.stringify(transferEvent, null, 4));
    // });
    // var event = await contract?.getPastEvents(
    //   "Approve", // Feel free to change this to 'Transfer' to see only the transfer events
    //   {
    //     // We fetch the latest block number and subtract 100 to ensure that
    //     // we get the events from the last 100 blocks.
    //     fromBlock: (await GetLatestBlockNUmber()) - 100,
    //     toBlock: "latest",
    //   }
    // );

    // console.log("Total events: ", event.length);
    // console.log(event[event.length - 1]);
  }
  useEffect(() => {
    // read halted from contract
    const getHaltedStatus = async () => {
      const contract = new Contract(
        L1_BITDAO_TOKEN_ADDRESS,
        TOKEN_ABI,
        provider
      );
      if (contract) {
        await GetPastEvents(contract);
      }
    };
    getHaltedStatus();
  }, [provider]);
  // async function GetLatestBlockNUmber() {
  //   const currentBlock = await provider.getBlock("latest");
  //   return currentBlock.number;
  // }

  return (
    <div>
      {approvals?.map((approval) => (
        <div key={approval.transactionHash} className="border-b">
          <div>
            Tx Hash:
            <TxLink
              chainId={L1_CHAIN_ID}
              txHash={approval.transactionHash}
              className="justify-start items-center"
              asHash
            />
          </div>
          <div>Block: {approval.blockNumber}</div>
          {/* <div>{approval.getBlock()}</div> */}
          {/* <div>time {blockToTime(approval.blockNumber)}</div> */}
          <div>Wallet: {approval.args?.length && approval?.args[0]}</div>
          <div>
            Amount:{" "}
            {approval.args?.length && formatEther(approval.args[2] || "0")}
          </div>
        </div>
      ))}
    </div>
  );
}
