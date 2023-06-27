// We create new providers here to connect to the selected rpc
import { providers } from "ethers";

// Configure against the correct chainIds
import { CHAINS, L1_CHAIN_ID } from "@config/constants";

// Use addSync to add operations and Store to interact with entity storage
import { addSync, Store } from "@mantle/supagraph";

// Supagraph specific constants detailing the contracts we'll sync against
import {
  L1_START_BLOCK,
  L1_STATE_COMMITMENT_CHAIN,
  STATE_COMMITMENT_CHAIN_STATE_BATCH_APPENDED_ABI,
  L1StateBatchAppendedEntity,
  L1StateBatchAppendedEvent,
} from "./config";

// configure JsonRpcProvider for L1
const L1_PROVIDER = new providers.JsonRpcProvider(
  `https://${CHAINS[L1_CHAIN_ID].chainName.toLowerCase()}.infura.io/v3/${
    process.env.NEXT_PUBLIC_INFURA_API_KEY
  }`
);

// Sync StateBatch commitments
export const L1StateBatchAppendedHandler = addSync<L1StateBatchAppendedEvent>({
  // Set the name of the event we're consuming with this handler (1 event per handler)
  eventName: "StateBatchAppended",
  // Connect the sync to L1 Provider and set the sync startBlock
  provider: L1_PROVIDER,
  startBlock: L1_START_BLOCK,
  // Define the event we're indexing with this handler
  address: L1_STATE_COMMITMENT_CHAIN,
  eventAbi: STATE_COMMITMENT_CHAIN_STATE_BATCH_APPENDED_ABI,
  // Construct the callback we'll use to index the event
  onEvent: async (args, { tx }) => {
    // load the entity for this batchIndex
    const entity = await Store.get<L1StateBatchAppendedEntity>(
      "StateBatchAppend",
      // the ID we'll index this entity under
      args.batchIndex,
      // we can set this to true to disable entity hydration if we know we're not going to use any of the old values in the new state
      true
    );

    // set details for appended batch (id'd according to batchIndex)
    entity.set("batchRoot", args.batchRoot);
    entity.set("batchIndex", args.batchIndex);
    entity.set("batchSize", args.batchSize);
    entity.set("prevTotalElements", args.prevTotalElements);
    entity.set("signature", args.signature);
    entity.set("extraData", args.extraData);
    // set the tx details into the entity
    entity.set("txBlock", tx.blockNumber);
    entity.set("txHash", tx.transactionHash);
    entity.set("txIndex", tx.transactionIndex);

    // save the changes
    await entity.save();
  },
});
