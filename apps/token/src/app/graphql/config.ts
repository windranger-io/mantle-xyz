// type bns as bns
import { BigNumber } from "ethers";

// export the complete supagraph configuration (sync & graph)
export const config = {
  // Name your supagraph (this will inform mongo table name etc...)
  name: "supagraph--token--0-0-6",
  // Configure providers
  providers: {
    5: {
      rpcUrl: `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    },
  },
  // Register the providers (which mappings should be registered?)
  enabled: [5],
  // Establish all event signatures available to supagraph
  events: [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
    "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
  ],
  // Configure available Contracts and their block details
  contracts: {
    mantle: {
      address: "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604",
      startBlock: 9127688,
      endBlock: "latest",
      chainId: 5,
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
      to: String!
      balance: BigInt!
      votes: BigInt!
      delegators: [Delegate!]! @derivedFrom(field: "to")
      delegatorsCount: BigInt!
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
        to
        votes
        balance
        delegatorsCount
        delegators {
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
export default config;

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
