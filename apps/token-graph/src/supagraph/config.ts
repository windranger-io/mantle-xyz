// Assign default value to provided env
import { withDefault } from "supagraph";

// Export the complete supagraph configuration (sync & graph)
const config = {
  // set the local engine (true: db || false: mongo) (dev is invalid here)
  dev: false,
  // name your supagraph (this will inform mongo table name etc...)
  name: withDefault(
    process.env.SUPAGRAPH_NAME,
    "supagraph--token-express--testnet--0-0-1"
  ),
  // flag immutable to groupBy queries before filtering for matches
  mutable: false,
  // how often do we want queries to be revalidated?
  revalidate: 12,
  staleWhileRevalidate: 59,
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
