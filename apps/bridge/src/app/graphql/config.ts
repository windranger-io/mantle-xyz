// Name your supagraph (this will inform mongo table name etc...)
export const SUPAGRAPH_NAME =
  process.env.SUPAGRAPH_NAME || "supergraph--bridge--0-0-1";

// Set the local engine (true: db || false: mongo)
export const SUPAGRAPH_DEV_ENGINE = false;

// Flag mutable to insert by upsert only on id field (otherwise use _block_number + id to make a unique entry and do a distinct groupBy on the id when querying)
export const SUPAGRAPH_MUTABLE_ENTITIES = true;

// Define the schema we will follow in our syncs and queries
export const SUPAGRAPH_SCHEMA = `
    type StateBatchAppend @entity {
      id: ID!
      batchRoot: String
      batchIndex: BigInt
      batchSize: BigInt
      prevTotalElements: BigInt
      signature: String
      extraData: String
      txBlock: String
      txHash: String
      txIndex: BigInt
    }
`;

// Define the default query we want to show in graphiql
export const SUPAGRAPH_DEFAULT_QUERY = `
    query MostRecentUpdates {
      stateBatchAppends(first: 10, skip: 0, orderBy: batchIndex, orderDirection: desc) {
        batchIndex
        prevTotalElements
        batchSize
      }
    }
`;

// How often do we want the queries to be revalidated?
export const SUPAGRAPH_REVALIDATE = 12;
export const SUPAGRAPH_STALE_WHILE_REVALIDATE = 59;

// Blocks to start collecting events from
export const L1_START_BLOCK =
  (process.env.SUPAGRAPH_L1_START_BLOCK &&
    parseInt(process.env.SUPAGRAPH_L1_START_BLOCK || "0", 10)) ||
  8191063;

// StateCommitment Contract for L1
export const L1_STATE_COMMITMENT_CHAIN =
  process.env.SUPAGRAPH_L1_STATE_COMMITMENT_CHAIN ||
  "0x91A5D806BA73d0AA4bFA9B318126dDE60582e92a";

// ABI for StateBatchAppended event
export const STATE_COMMITMENT_CHAIN_STATE_BATCH_APPENDED_ABI = [
  "event StateBatchAppended(uint256 indexed batchIndex, bytes32 batchRoot, uint256 batchSize, uint256 prevTotalElements, bytes signature, bytes extraData)",
];

// Definitions for the Events args (as defined in the abi)
export type L1StateBatchAppendedEvent = {
  batchRoot: string;
  batchIndex: string;
  batchSize: string;
  prevTotalElements: string;
  signature: string;
  extraData: string;
};

// Definitions for the entity we're saving on each L1StateBatchAppendedEvent
export type L1StateBatchAppendedEntity = {
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
};
