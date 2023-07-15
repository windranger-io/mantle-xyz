// Use Store to interact with entity storage
import { Store } from "@mantle/supagraph";

// Supagraph specific constants detailing the contracts we'll sync against
import { TransactionReceipt } from "@ethersproject/providers";
import { StateBatchAppendedEntity, StateBatchAppendedEvent } from "../types";

// Sync StateBatch commitments
export const StateBatchAppendedHandler = async (
  args: StateBatchAppendedEvent,
  { tx }: { tx: TransactionReceipt }
) => {
  // load the entity for this batchIndex
  const entity = await Store.get<StateBatchAppendedEntity>(
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
};
