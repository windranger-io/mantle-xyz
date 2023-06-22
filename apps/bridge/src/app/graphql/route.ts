/* eslint-disable prefer-destructuring */

// Return graphql server as next request handler
import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";

// Open a connection to the db to pull the queried data
import { getMongodb } from "@providers/mongoClient";

// Construct subgraph flavoured graphql server which resolves to Mongo queries
import {
  mongoResolver,
  memoryResolver,
  createSupergraph,
} from "@mantle/supergraph";

// Import connection config from local dir
import {
  SUPERGRAPH_NAME,
  SUPERGRAPH_SCHEMA,
  SUPERGRAPH_DEFAULT_QUERY,
  SUPERGRAPH_DEV_ENGINE,
  SUPERGRAPH_REVALIDATE,
  SUPERGRAPH_STALE_WHILE_REVALIDATE,
} from "./config";

// revalidate this page every 12s (avg block time)
export const revalidate = SUPERGRAPH_REVALIDATE;

// extract env vars
const NODE_ENV = process.env.NODE_ENV;
const MONGODB_URI = process.env.MONGODB_URI;

// create a new supergraph handler
const graphql = createSupergraph<NextApiRequest, NextApiResponse>({
  // setup the entities (we're feeding in a mongo/mem-db driven store here - all queries are made at runtime directly against mongo in 1 request or are fully satisified from a local cache)
  entities:
    // switch out the resolver for different environments/conditions
    (NODE_ENV === "development" && SUPERGRAPH_DEV_ENGINE) ||
    // or if the mongodb uri isnt set...
    !MONGODB_URI
      ? // for development we can keep entities in node-persist and share between connections
        memoryResolver({
          // name the database (in-memory/persisted on disk to .next dir)
          name: SUPERGRAPH_NAME,
        })
      : // for production/production like we want to query mongo for results...
        mongoResolver({
          // name the database (pesisted to mongodb)
          name: SUPERGRAPH_NAME,
          // connect to mongodb
          client: getMongodb(
            // this obviously needs putting in an env
            MONGODB_URI
          ),
          // skip groupBy on time/block - each id is unique in this set of syncs
          uniqueIds: true,
        }),
  // pass in the simplified graphql schema
  schema: SUPERGRAPH_SCHEMA,
  // set the default query to show in graphiql
  defaultQuery: SUPERGRAPH_DEFAULT_QUERY,
  // set cacheControl header on response
  headers: {
    "Cache-Control": `max-age=${SUPERGRAPH_REVALIDATE}, public, s-maxage=${SUPERGRAPH_REVALIDATE}, stale-while-revalidate=${SUPERGRAPH_STALE_WHILE_REVALIDATE}`,
  },
});

// GET will always return the graphiql user interface...
export async function GET(request: NextRequest) {
  try {
    // get html response
    const response = await graphql(request);

    console.log("test");

    // return via nextjs
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}

// POST methods exclusively accept and return JSON bodies...
export async function POST(request: NextRequest) {
  try {
    // get json response
    const response = await graphql(request);

    // process the graphql response
    return new NextResponse(JSON.stringify(await response.json()), {
      status: response.status,
      headers: response.headers,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
}
