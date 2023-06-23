/* eslint-disable no-console, no-underscore-dangle */

// Open a connection to the db to pull the queried data
import { getMongodb } from "@providers/mongoClient";

// Configure against the correct chainIds
import { CHAINS, L1_CHAIN_ID } from "@config/constants"; // L2_CHAIN_ID

// We create new providers here to connect to both L1 and L2
import { providers } from "ethers";

// Use addSync to add operations and Store to interact with entity storage
import { addSync, Store, Mongo, DB } from "@mantle/supergraph";

// Supergraph specific constants detailing the contracts we'll sync against
import {
  SUPERGRAPH_NAME,
  SUPERGRAPH_DEV_ENGINE,
  SUPERGRAPH_UNIQUE_IDS,
  L1_START_BLOCK,
  L1_STATE_COMMITMENT_CHAIN,
  STATE_COMMITMENT_CHAIN_STATE_BATCH_APPENDED_ABI,
} from "./config";

// configure JsonRpcProvider for L1
const L1_PROVIDER = new providers.JsonRpcProvider(
  `https://${CHAINS[L1_CHAIN_ID].chainName.toLowerCase()}.infura.io/v3/${
    process.env.NEXT_PUBLIC_INFURA_API_KEY
  }`
);

// switch out the engine for development to avoid the mongo requirment locally
Store.setEngine({
  // name the connection
  name: SUPERGRAPH_NAME,
  // db is dependent on state
  db:
    // in production/production like environments we want to store mutations to mongo otherwise we can store them locally
    process.env.NODE_ENV === "development" && SUPERGRAPH_DEV_ENGINE
      ? // connect store to in-memory/node-persist store
        DB.create({ kv: {}, name: SUPERGRAPH_NAME })
      : // connect store to MongoDB
        Mongo.create({
          kv: {},
          name: SUPERGRAPH_NAME,
          uniqueIds: SUPERGRAPH_UNIQUE_IDS,
          client: getMongodb(process.env.MONGODB_URI!),
        }),
});

// Sync StateBatch commitments
export const L1StateBatchAppendedHandler = addSync<{
  _batchRoot: string;
  _batchIndex: string;
  _batchSize: string;
  _prevTotalElements: string;
  _signature: string;
  _extraData: string;
}>(
  "StateBatchAppended",
  L1_STATE_COMMITMENT_CHAIN,
  L1_PROVIDER,
  L1_START_BLOCK,
  STATE_COMMITMENT_CHAIN_STATE_BATCH_APPENDED_ABI,
  async (args, { tx }) => {
    // load the entity for this batchIndex
    const entity = await Store.get<{
      id: string;
      batchRoot: string;
      batchIndex: string;
      batchSize: string;
      prevTotalElements: string;
      signature: string;
      extraData: string;
      txBlock: number;
      txHash: string;
      txIndex: number;
    }>("StateBatchAppend", args._batchIndex, true);

    // set details for appended batch (id'd according to batchIndex)
    entity.set("id", args._batchIndex);
    entity.set("batchRoot", args._batchRoot);
    entity.set("batchIndex", args._batchIndex);
    entity.set("batchSize", args._batchSize);
    entity.set("prevTotalElements", args._prevTotalElements);
    entity.set("signature", args._signature);
    entity.set("extraData", args._extraData);
    // set the tx details into the entity
    entity.set("txBlock", tx.blockNumber);
    entity.set("txHash", tx.transactionHash);
    entity.set("txIndex", tx.transactionIndex);

    // save the changes
    await entity.save();
  }
);
