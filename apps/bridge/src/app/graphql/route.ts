// Return graphql server as next request handler
import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";

// Construct subgraph flavoured graphql server
import {
  createSupagraph,
  memoryResolver,
  mongoResolver,
} from "@mantle/supagraph";

// Import connection config from local dir
import { getMongodb } from "@providers/mongoClient";
import {
  SUPAGRAPH_SCHEMA,
  SUPAGRAPH_DEFAULT_QUERY,
  SUPAGRAPH_REVALIDATE,
  SUPAGRAPH_STALE_WHILE_REVALIDATE,
  SUPAGRAPH_DEV_ENGINE,
  SUPAGRAPH_NAME,
  SUPAGRAPH_UNIQUE_IDS,
} from "./config";

// Revalidate this page every 12s (avg block time)
export const revalidate = SUPAGRAPH_REVALIDATE;

// Create a new supagraph handler
const graphql = createSupagraph<NextApiRequest, NextApiResponse>({
  // setup the entities (we're feeding in a mongo/mem-db driven store here - all queries are made at runtime directly against mongo in 1 request or are fully satisified from a local cache)
  entities:
    (process.env.NODE_ENV === "development" && SUPAGRAPH_DEV_ENGINE) ||
    // or if the mongodb uri isnt set...
    !process.env.MONGODB_URI
      ? // for development we can keep entities in node-persist and share between connections
        memoryResolver({
          // name the database (in-memory/persisted on disk to .next dir)
          name: SUPAGRAPH_NAME,
        })
      : // for production/production like we want to query mongo for results...
        mongoResolver({
          // name the database (pesisted to mongodb)
          name: SUPAGRAPH_NAME,
          // connect to mongodb
          client: getMongodb(
            // this obviously needs putting in an env
            process.env.MONGODB_URI
          ),
          // skip groupBy on time/block - each id is unique in this set of syncs
          uniqueIds: SUPAGRAPH_UNIQUE_IDS,
        }),
  // pass in the simplified graphql schema
  schema: SUPAGRAPH_SCHEMA,
  // set the default query to show in graphiql
  defaultQuery: SUPAGRAPH_DEFAULT_QUERY,
  // set cacheControl header on response
  headers: {
    "Cache-Control": `max-age=${SUPAGRAPH_REVALIDATE}, public, s-maxage=${SUPAGRAPH_REVALIDATE}, stale-while-revalidate=${SUPAGRAPH_STALE_WHILE_REVALIDATE}`,
  },
});

// GET will always return the graphiql user interface...
export async function GET(request: NextRequest) {
  try {
    // get html response
    const response = await graphql(request);

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
