// Name your supergraph (this will inform mongo table name etc...)
export const SUPERGRAPH_NAME = "supergraph--bridge--0-0-1";

// Set the local engine (true: db || false: mongo)
export const SUPERGRAPH_DEV_ENGINE = false;

// Define the schema we will follow in our syncs and queries
export const SUPERGRAPH_SCHEMA = `
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
export const SUPERGRAPH_DEFAULT_QUERY = `
    {
      stateBatchAppends(first: 10, skip: 0, orderBy: batchIndex, orderDirection: desc) {
        prevTotalElements
        batchSize
      }
    }
`;

// How often do we want the queries to be revalidated?
export const SUPERGRAPH_REVALIDATE = 12;
export const SUPERGRAPH_STALE_WHILE_REVALIDATE = 59;

// Blocks to start collecting events from
export const L1_START_BLOCK = 8191063;

// StateCommitment Contract for L1
export const L1_STATE_COMMITMENT_CHAIN =
  "0x91A5D806BA73d0AA4bFA9B318126dDE60582e92a";

// ABI for StateBatchAppended event
export const STATE_COMMITMENT_CHAIN_STATE_BATCH_APPENDED_ABI = [
  "event StateBatchAppended(uint256 indexed _batchIndex, bytes32 _batchRoot, uint256 _batchSize, uint256 _prevTotalElements, bytes _signature, bytes _extraData)",
];
