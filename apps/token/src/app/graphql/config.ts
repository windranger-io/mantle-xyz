// type bns as bns
import { BigNumber } from "ethers";

// configure the L1 chain we're using
export const L1_CHAIN_ID = "5";
export const L1_CHAIN_NAME = "goerli";

// Name your supagraph (this will inform mongo table name etc...)
export const SUPAGRAPH_NAME = "supagraph--token--0-0-5";

// Set the local engine (true: db || false: mongo)
export const SUPAGRAPH_DEV_ENGINE = false;

// Flag unique ids to insert by upsert only on id field (otherwise use _block_number + id to make a unique entry and do a distinct groupBy on the id when querying)
export const SUPAGRAPH_UNIQUE_IDS = true;

// Define the schema we will follow in our syncs and queries
export const SUPAGRAPH_SCHEMA = `
  type Delegate @entity {
    id: ID!
    to: String!
    balance: BigInt!
    votes: BigInt!
    delegators: [Delegate!]! @derivedFrom(field: "to")
    delegatorsCount: BigInt!
    blockNumber: BigInt!
    transactionHash: String!
  }
`;

// Define the default query we want to show in graphiql
export const SUPAGRAPH_DEFAULT_QUERY = `
    {
      delegates(first: 10, orderBy: votes, orderDirection: desc) {
        id
        to
        votes
        balance
        delegatorsCount
        delegators{
          id
        }
      }
    }
`;

// How often do we want the queries to be revalidated?
export const SUPAGRAPH_REVALIDATE = 12;
export const SUPAGRAPH_STALE_WHILE_REVALIDATE = 59;

// Blocks to start collecting events from
export const L1_START_BLOCK = 9127688;

// StateCommitment Contract for L1
export const L1_MANTLE_TOKEN = "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604";

// ABI for StateBatchAppended event
export const LN_MANTLE_TOKEN_ABI = [
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
  "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
  "event Initialized(uint8 version)",
  "event MintCapNumeratorChanged(address indexed from, uint256 previousMintCapNumerator, uint256 newMintCapNumerator)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// Definitions for the Approval Events args (as defined in the abi)
export type ApprovalEvent = {
  owner: string;
  spender: string;
  value: BigNumber;
};

// Definitions for the DelegateChanged Events args (as defined in the abi)
export type DelegateChangedEvent = {
  delegator: string;
  fromDelegate: string;
  toDelegate: string;
};

// Definitions for the DelegateVotesChanged Events args (as defined in the abi)
export type DelegateVotesChangedEvent = {
  delegate: string;
  previousBalance: BigNumber;
  newBalance: BigNumber;
};

// Definitions for the Initialized Events args (as defined in the abi)
export type InitializedEvent = {
  version: BigNumber;
};

// Definitions for the MintCapNumeratorChanged Events args (as defined in the abi)
export type MintCapNumeratorChangedEvent = {
  from: string;
  previousMintCapNumerator: BigNumber;
  newMintCapNumerator: BigNumber;
};

// Definitions for the OwnershipTransferred Events args (as defined in the abi)
export type OwnershipTransferredEvent = {
  previousOwner: string;
  newOwner: string;
};

// Definitions for the Transferred Events args (as defined in the abi)
export type TransferEvent = {
  from: string;
  to: string;
  value: string;
};

// Delegate entity definition
export type DelegateEntity = {
  id: string;
  to: string;
  balance: BigNumber;
  votes: BigNumber;
  delegatorsCount: BigNumber;
  blockNumber: number;
  transactionHash: string;
};
