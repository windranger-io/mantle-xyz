// Assign default value to provided env
import { withDefault } from "@mantle/supagraph";

// Export the complete supagraph configuration (sync & graph) - we can add everything from Mappings to this config
const config = {
  // set the local engine (true: db || false: mongo)
  dev: false,
  // name your supagraph (this will inform mongo table name etc...)
  name: withDefault(
    process.env.SUPAGRAPH_NAME,
    "supagraph--token--testnet--0-0-1"
  ),
  // flag mutable to insert by upsert only on id field (mutate entities)
  // - otherwise use _block_number + id to make a unique entry and do a distinct groupBy on the id when querying
  //   ie: do everything the immutable way (this can be a lot more expensive)
  mutable: true,
  // how often do we want queries to be revalidated?
  revalidate: 12,
  staleWhileRevalidate: 59,
  // configure providers
  providers: {
    1: {
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    },
    5: {
      rpcUrl: `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    },
  },
  // register events into named groups
  events: {
    token: [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
      "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
    ],
  },
  // configure available Contracts and their block details
  contracts: {
    mantle: {
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: "token",
      // use handlers registered against "token" named group in handlers/index.ts
      handlers: "token",
      // set config from env
      chainId: withDefault(process.env.MANTLE_CHAIN_ID, 5),
      address: withDefault(
        process.env.MANTLE_ADDRESS,
        "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604"
      ),
      startBlock: withDefault(process.env.MANTLE_START_BLOCK, 9127688),
      endBlock: withDefault(process.env.MANTLE_END_BLOCK, "latest"),
      // we don't receipts here
      collectTxReceipts: false,
    },
    bitdao: {
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: "token",
      // use handlers registered against "token" named group in handlers/index.ts
      handlers: "token",
      // set config from env
      chainId: withDefault(process.env.BITDAO_CHAIN_ID, 5),
      address: withDefault(
        process.env.BITDAO_ADDRESS,
        "0xB17B140eddCC575DaD4256959b8A35d0E7E1Ae17"
      ),
      startBlock: withDefault(process.env.BITDAO_START_BLOCK, 7728490),
      endBlock: withDefault(process.env.BITDAO_END_BLOCK, "latest"),
      // we don't receipts here
      collectTxReceipts: false,
    },
  },
  // define supagraph schema
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
        bitVotes
        mntVotes
        balance
        bitBalance
        mntBalance
        delegatorsCount
        bitDelegatorsCount
        mntDelegatorsCount
        bitDelegators {
          id
        }
        mntDelegators {
          id
        }
      }
    }
  `,
};

// export config as default export
export default config;
