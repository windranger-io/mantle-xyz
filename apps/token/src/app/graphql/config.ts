// type bns as bns
import { BigNumber } from "ethers";

// export the complete supagraph configuration (sync & graph)
export const supagraph = {
  // Name your supagraph (this will inform mongo table name etc...)
  name: process.env.SUPAGRAPH_NAME || "supagraph--token--testnet--0-0-1",
  // Configure providers
  providers: {
    1: {
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    },
    5: {
      rpcUrl: `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    },
  },
  // Establish all event signatures available to supagraph
  events: [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
    "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
  ],
  // Configure available Contracts and their block details
  contracts: {
    mantle: {
      // set config from env
      chainId:
        (process.env.MANTLE_CHAIN_ID &&
          parseInt(process.env.MANTLE_CHAIN_ID, 10)) ||
        5,
      address:
        process.env.MANTLE_ADDRESS ||
        "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604",
      startBlock:
        (process.env.MANTLE_START_BLOCK &&
          parseInt(process.env.MANTLE_START_BLOCK, 10)) ||
        9127688,
      endBlock: process.env.MANTLE_END_BLOCK || "latest",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
        "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
      ],
    },
    bitdao: {
      // set config from env
      chainId:
        (process.env.BITDAO_CHAIN_ID &&
          parseInt(process.env.BITDAO_CHAIN_ID, 10)) ||
        5,
      address:
        process.env.BITDAO_ADDRESS ||
        "0xB17B140eddCC575DaD4256959b8A35d0E7E1Ae17",
      startBlock:
        (process.env.BITDAO_START_BLOCK &&
          parseInt(process.env.BITDAO_START_BLOCK, 10)) ||
        7728490,
      endBlock: process.env.BITDAO_END_BLOCK || "latest",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
        "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
      ],
    },
  },
  // Define supagraph schema
  schema: `
    type Delegate @entity {
      id: ID!
      bitTo: String!
      mntTo: String!
      balance: BigInt!
      mntBalance: BigInt!
      bitBalance: BigInt!
      votes: BigInt!
      bitVotes: BigInt!
      mntVotes: BigInt!
      bitDelegators: [Delegate!]! @derivedFrom(field: "bitTo")
      mntDelegators: [Delegate!]! @derivedFrom(field: "mntTo")
      delegatorsCount: BigInt!
      mntDelegatorsCount: BigInt!
      bitDelegatorsCount: BigInt!
      blockNumber: BigInt!
      transactionHash: String!
    }
  `,
  // define supagraph default query
  defaultQuery: `
    query TopTenDelegatesByVotes {
      delegates(
        first: 10
        orderBy: votes
        orderDirection: desc
        where: {votes_gt: "0"}
      ) {
        id
        mntTo
        bitTo
        votes
        balance
        delegatorsCount
        bitDelegators {
          id
        }
        mntDelegators {
          id
        }
      }
    }
  `,
  // Set the local engine (true: db || false: mongo)
  dev: false,
  // Flag mutable to insert by upsert only on id field
  // - otherwise use _block_number + id to make a unique entry and do a distinct groupBy on the id when querying
  //   ie: do everything the immutable way (this can be a lot more expensive)
  mutable: true,
  // How often do we want queries to be revalidated?
  revalidate: 12,
  staleWhileRevalidate: 59,
};

// export config as default export
export default supagraph;

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
  bitTo: string;
  mntTo: string;
  balance: BigNumber;
  mntBalance: BigNumber;
  bitBalance: BigNumber;
  votes: BigNumber;
  mntVotes: BigNumber;
  bitVotes: BigNumber;
  delegatorsCount: BigNumber;
  mntDelegatorsCount: BigNumber;
  bitDelegatorsCount: BigNumber;
  blockNumber: number;
  transactionHash: string;
};
