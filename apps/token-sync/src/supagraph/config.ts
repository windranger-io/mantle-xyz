// Assign default value to provided env
import { SyncConfig, withDefault } from "supagraph";

// import env file and load contents
import dotenv from "dotenv";
dotenv.config();

// Export the complete supagraph configuration (sync & graph)
export const config: SyncConfig = {
  // name your supagraph (this will inform mongo table name etc...)
  name: withDefault(
    process.env.SUPAGRAPH_NAME,
    "supagraph--token-express--testnet--0-1-1"
  ),
  // set the local engine (true: db || false: mongo)
  dev: false,
  // set the reset condition (should the local db be restarted on sync?)
  reset: true,
  // should we cleanup files after the initial sync?
  cleanup: true,
  // listen for updates as a daemon operation
  listen: true,
  // hide console log
  silent: withDefault(process.env.SUPAGRAPH_SILENT, false),
  // set readOnly mode - disables writes to mongodb
  readOnly: withDefault(process.env.SUPAGRAPH_READONLY, false),
  // number of workers to dedicate to block processing
  numBlockWorkers: withDefault(process.env.SUPAGRAPH_BLOCK_WORKERS, 12),
  // number of workers to dedicate to transaction processing
  numTransactionWorkers: withDefault(process.env.SUPAGRAPH_TX_WORKERS, 32),
  // reducing number of concurrent reqs made on promiseQueue - want to reduce the likelyhood of these timing out and rejecting
  concurrency: withDefault(process.env.SUPAGRAPH_CONCURRENCY, 10),
  // should the heap_dumps and errors be reported in the ingestion process (we can safely ignore errors in prod)
  printIngestionErrors: withDefault(
    process.env.SUPAGRAPH_INGESTION_LOGS,
    false
  ),
  // collect blocks to sort by ts
  collectBlocks: true,
  // flag mutable to insert by upsert only on id field (mutate entities)
  // - otherwise use _block_number + id to make a unique entry and do a distinct groupBy on the id when querying
  //   ie: do everything the immutable way (this can be a lot more expensive)
  mutable: false,
  // how often do we want queries to be revalidated?
  revalidate: 12,
  staleWhileRevalidate: 59,
  // configure providers
  providers: {
    1: {
      rpcUrl:
        "https://eth-mainnet.g.alchemy.com/v2/SAHsqwOlJwwKDMVVxm3btE0yNzEYTXK4",
    },
    5: {
      rpcUrl:
        "https://eth-goerli.g.alchemy.com/v2/bn2bNKk1scsttlQTK00-FQ3ZoQT4FB1e",
    },
    [process.env.L2_MANTLE_CHAIN_ID]: {
      rpcUrl: withDefault(
        process.env.MANTLE_RPC_URI,
        "https://rpc.testnet.mantle.xyz"
      ),
    },
  },
  // register events into named groups
  events: {
    tokenl1: [
      "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
      "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
    ],
    tokenl2: [
      "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
    ],
    nativeTokenl2: [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ],
  },
  // configure available Contracts and their block details
  contracts: {
    mantle: {
      // establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: "tokenl1",
      // use handlers registered against "token" named group in handlers/index.ts
      handlers: "tokenl1",
      // set config from env
      chainId: withDefault(process.env.MANTLE_CHAIN_ID, 5),
      address: withDefault(
        process.env.MANTLE_ADDRESS,
        "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604"
      ),
      startBlock: withDefault(process.env.MANTLE_START_BLOCK, 9127688),
      endBlock: withDefault(process.env.MANTLE_END_BLOCK, "latest"),
    },
    bitdao: {
      // establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: "tokenl1",
      // use handlers registered against "token" named group in handlers/index.ts
      handlers: "tokenl1",
      // set config from env
      chainId: withDefault(process.env.BITDAO_CHAIN_ID, 5),
      address: withDefault(
        process.env.BITDAO_ADDRESS,
        "0xB17B140eddCC575DaD4256959b8A35d0E7E1Ae17"
      ),
      startBlock: withDefault(process.env.BITDAO_START_BLOCK, 7728490),
      endBlock: withDefault(process.env.BITDAO_END_BLOCK, "latest"),
    },
    l2mantle: {
      // establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: "tokenl2",
      // use handlers registered against "token" named group in handlers/index.ts
      handlers: "tokenl2",
      // set config from env
      chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
      address: withDefault(
        process.env.L2_MANTLE_ADDRESS,
        "0xEd459209796D741F5B609131aBd927586fcCACC5"
      ),
      startBlock: withDefault(process.env.L2_MANTLE_START_BLOCK, 18889522),
      endBlock: withDefault(process.env.L2_MANTLE_END_BLOCK, "latest"),
      // collect the receipts
      collectTxReceipts: true,
    },
  },
  // define supagraph schema
  schema: `
    type Delegate @entity {
      id: ID!
      bitTo: String!
      mntTo: String!
      l2MntTo: String!
      votes: BigInt!
      mntVotes: BigInt!
      bitVotes: BigInt!
      l2MntVotes: BigInt!
      mntDelegators: [Delegate!]! @derivedFrom(field: "mntTo")
      bitDelegators: [Delegate!]! @derivedFrom(field: "bitTo")
      l2MntDelegators: [Delegate!]! @derivedFrom(field: "l2MntTo")
      delegatorsCount: BigInt!
      mntDelegatorsCount: BigInt!
      bitDelegatorsCount: BigInt!
      l2MntDelegatorsCount: BigInt!
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
        bitTo
        mntTo
        l2MntTo
        votes
        bitVotes
        mntVotes
        l2MntVotes
        delegatorsCount
        bitDelegatorsCount
        mntDelegatorsCount
        l2MntDelegatorsCount
        bitDelegators {
          id
        }
        mntDelegators {
          id
        }
        l2MntDelegators {
          id
        }
      }
    }
  `,
};

// export config as default export
export default config;
