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
  // name your supagraph (this will inform mongo table name etc... we default all props to testnet config)
  name: withDefault(
    process.env.SUPAGRAPH_NAME,
    "supergraph--testnet--bridge--0-0-1"
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
    11155111: {
      rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/XMS1J6f654XZolfd7oaMe-kaNPEpWifX`,
    },
    5000: {
      rpcUrl: `https://rpc.mantle.xyz`,
    },
    5001: {
      rpcUrl: `https://rpc.testnet.mantle.xyz`,
    },
    5003: {
      rpcUrl: `https://rpc.sepolia.mantle.xyz`,
    },
  },
  // configure available Contracts and their block details
  contracts: {
    Messenger: {
      // set the handlers
      handlers: "Messenger",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        "event RelayedMessage(bytes32 indexed msgHash)",
        "event FailedRelayedMessage(bytes32 indexed msgHash)",
      ],
      // set config from env
      chainId: withDefault(process.env.NEXT_PUBLIC_L2_CHAIN_ID, 5),
      address: withDefault(
        process.env.SUPAGRAPH_L2_CROSS_DOMAIN_MESSENGER,
        "0x4200000000000000000000000000000000000007"
      ),
      startBlock: withDefault(
        process.env.SUPAGRAPH_L2_CROSS_DOMAIN_MESSENGER_START_BLOCK,
        15422259
      ),
      endBlock: withDefault(
        process.env.SUPAGRAPH_L2_CROSS_DOMAIN_MESSENGER_END_BLOCK,
        "latest"
      ),
      // additional option to collect tx's via the syncOp
      collectTxReceipts: false,
    },
    standardBridge: {
      // set the handlers
      handlers: "StandardBridge",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        "event ETHDepositInitiated(address indexed _from, address indexed _to, uint256 _amount, bytes _data)",
        "event ERC20DepositInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
      ],
      // set config from env
      chainId: withDefault(process.env.NEXT_PUBLIC_L1_CHAIN_ID, 5),
      address: withDefault(
        process.env.SUPAGRAPH_L1_STANDARD_BRIDGE,
        "0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330"
      ),
      startBlock: withDefault(
        process.env.SUPAGRAPH_L1_STANDARD_BRIDGE_START_BLOCK,
        9341977
      ),
      endBlock: withDefault(
        process.env.SUPAGRAPH_L1_STANDARD_BRIDGE_END_BLOCK,
        "latest"
      ),
      // additional option to collect tx's via the syncOp
      collectTxReceipts: true,
    },
    StateCommitmentChain: {
      // set the handlers
      handlers: "StateCommitmentChain",
      // Establish all event signatures available on this contract (we could also accept a .sol or .json file here)
      events: [
        "event StateBatchAppended(uint256 indexed batchIndex, bytes32 batchRoot, uint256 batchSize, uint256 prevTotalElements, bytes signature, bytes extraData)",
      ],
      // set config from env
      chainId: withDefault(process.env.NEXT_PUBLIC_L1_CHAIN_ID, 5),
      address: withDefault(
        process.env.SUPAGRAPH_L1_STATE_COMMITMENT_CHAIN,
        "0x91A5D806BA73d0AA4bFA9B318126dDE60582e92a"
      ),
      startBlock: withDefault(process.env.SUPAGRAPH_L1_START_BLOCK, 8191063),
      endBlock: withDefault(process.env.SUPAGRAPH_L1_END_BLOCK, "latest"),
      // additional option to collect tx's via the syncOp
      collectTxReceipts: false,
    },
  },
  // define supagraph schema
  schema: `
    type StateBatchAppend @entity {
      id: ID!
      batchRoot: String
      batchIndex: BigInt
      batchSize: BigInt
      prevTotalElements: BigInt
      signature: String
      extraData: String
      txBlock: Int
      txHash: String
      txIndex: BigInt
    }
    type L1ToL2Message @entity {
      id: ID!
      status: Int
      from: String
      messageNonce: BigInt
      sender: String
      target: String
      value: BigInt
      minGasLimit: BigInt
      amount: BigInt
      message: String
      l1Tx: String
      l2Tx: String
      l1BlockNumber: Int
      l2BlockNumber: Int
      l1Token: String
      l2Token: String
      gasDropped: Boolean
    }
  `,
  // define supagraph default query
  defaultQuery: `
    query MostRecentUpdates {
      stateBatchAppends(first: 10, skip: 0, orderBy: batchIndex, orderDirection: desc) {
        batchIndex
        prevTotalElements
        batchSize
      }
    }
  `,
};

// export config as default export
export default config;
