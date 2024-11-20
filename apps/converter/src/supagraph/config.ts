// Assign default value to provided env
import { withDefault } from "supagraph";

// Export the complete supagraph configuration (sync & graph) - we can add everything from Mappings to this config
const config = {
  // set the local engine (true: db || false: mongo)
  dev: false,
  // set the listening state of the sync
  listen: false,
  // should we cleanup the values we pull in the initial sync?
  cleanup: true,
  // name your supagraph (this will inform mongo table name etc...)
  name: withDefault(
    process.env.SUPAGRAPH_NAME,
    "supagraph--migrator--testnet--0-0-1"
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
      rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/C1HA_ubz9iHEBkGZi-LxwHijrRHzRhUe`,
    },
    5: {
      rpcUrl: `https://goerli.infura.io/v3/927668fc3dec43bcb1225299596c2e58`,
    },
  },
  // configure available Contracts and their block details
  contracts: {
    bitdao: {
      // use handlers registered against "token" named group in handlers/index.ts
      handlers: "token",
      // establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
      ],
      // set config from env
      chainId: withDefault(process.env.NEXT_PUBLIC_L1_CHAIN_ID, 5),
      address: withDefault(
        process.env.L1_BITDAO_CONTRACT_ADDRESS,
        "0x66245cB1236102bd5a59C0140cf80789B43d148F"
      ),
      // start watching for approvals following deployment of migratorV2
      startBlock: withDefault(
        process.env.L1_BITDAO_CONTRACT_START_BLOCK,
        9615905
      ),
      endBlock: withDefault(process.env.L1_BITDAO_CONTRACT_END_BLOCK, "latest"),
      // We will always collect receipts here to construct gas-cost of call Migration for refund
      collectTxReceipts: true,
    },
    migrator: {
      // set the handlers
      handlers: "migrator",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        process.env.NEXT_PUBLIC_L1_CHAIN_ID === "1"
          ? "event TokensMigrated(address indexed to, uint256 amountSwapped)"
          : "event TokensMigrated(address indexed to, uint256 amountSwapped, uint256 amountReceived)",
      ],
      // set config from env
      chainId: withDefault(process.env.NEXT_PUBLIC_L1_CHAIN_ID, 5),
      address: withDefault(
        process.env.L1_CONVERTER_CONTRACT_ADDRESS,
        "0x144D9B7F34a4e3133C6F347886fBe2700c4cb268"
      ),
      startBlock: withDefault(
        process.env.L1_CONVERTER_CONTRACT_START_BLOCK,
        9127692
      ),
      endBlock: withDefault(
        process.env.L1_CONVERTER_CONTRACT_END_BLOCK,
        "latest"
      ),
      // We will always collect receipts here to construct gas-cost of call Migration for refund
      collectTxReceipts: true,
    },
    migratorV2: {
      // set the handlers
      handlers: "migratorV2",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        "event TokensMigrated(address indexed to, uint256 amountSwapped)",
        "event TokenMigrationApproved(address indexed approver, address indexed user, uint256 amount)",
      ],
      // set config from env
      chainId: withDefault(process.env.NEXT_PUBLIC_L1_CHAIN_ID, 5),
      address: withDefault(
        process.env.L1_CONVERTER_V2_CONTRACT_ADDRESS,
        "0x1142141e5bdf32fbf9129cc8c03932014e23164c"
      ),
      startBlock: withDefault(
        process.env.L1_CONVERTER_V2_CONTRACT_START_BLOCK,
        9615905
      ),
      endBlock: withDefault(
        process.env.L1_CONVERTER_V2_CONTRACT_END_BLOCK,
        "latest"
      ),
      // We will always collect receipts here to construct gas-cost of call Migration for refund
      collectTxReceipts: true,
    },
  },
  // define supagraph schema
  schema: `
    type Account @entity {
      id: ID!
      migrations: [Migration!]! @derivedFrom(field: "account")
      migrationsV2: [MigrationV2!]! @derivedFrom(field: "account")
      pendingMigrationsV2: [PendingMigrationV2!]! @derivedFrom(field: "account")
      migratedMnt: BigInt!
      migrationCount: Int!
      migrationCountV2: Int!
      blockNumber: BigInt!
      transactionHash: String! 
    }
    type Migration @entity {
      id: ID!
      account: Account!
      amountSwapped: BigInt!
      gasCost: BigInt!
      refunded: Boolean!
      refundTx: String!
      blockTimestamp: Int!
      blockNumber: Int!
      transactionHash: String!
    }
    type MigrationV2 @entity {
      id: ID!
      account: Account!
      amountApproved: BigInt!
      amountSwapped: BigInt!
      gasCost: BigInt!
      refunded: Boolean!
      refundTx: String!
      blockTimestamp: Int!
      blockNumber: Int!
      approvedBy: String!
      approvalTx: String!
      approvalBlockTimestamp: Int!
      approvalBlockNumber: Int!
      transactionHash: String!
      status: String!
    }
    type PendingMigrationV2 @entity {
      id: ID!
      account: Account!
      amountApproved: BigInt!
      amountSwapped: BigInt!
      gasCost: BigInt!
      refunded: Boolean!
      refundTx: String!
      blockTimestamp: Int!
      blockNumber: Int!
      transactionHash: String!
      approvedBy: String!
      approvalTx: String!
      approvalBlockTimestamp: Int!
      approvalBlockNumber: Int!
      status: String!
    }
  `,
  // define supagraph default query
  defaultQuery: `
    query TopTenMNTMigrators {
      accounts(
        first: 10
        orderBy: migratedMnt
        orderDirection: desc
        where: {migratedMnt_gt: "0"}
      ) {
        id
        migratedMnt
        migrationCount
        migrationCountV2
        migrations(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
          amountSwapped
          gasCost
          refunded
          refundTx
          blockTimestamp
          transactionHash
        }
        migrationsV2(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
          amountSwapped
          gasCost
          refunded
          refundTx
          blockTimestamp
          transactionHash
          approvedBy
          approvalBlockTimestamp
          approvalTx
        }
        pendingMigrationsV2(
          where: {status_not: "COMPLETE"}
          first: 10
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          amountSwapped
          gasCost
          refunded
          refundTx
          blockTimestamp
          transactionHash
        }
      }
    } 
  `,
};

// export config as default export
export default config;
