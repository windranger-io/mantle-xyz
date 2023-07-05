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

// Import the currect configuration
import { supagraph } from "./config";

// Revalidate this page every 12s (avg block time)
export const { revalidate } = supagraph;

// Create a new supagraph handler
const graphql = createSupagraph<NextApiRequest, NextApiResponse>({
  // pass in the graphql schema
  schema: supagraph.schema,
  // setup the entities (we're feeding in a mongo/mem-db driven store here - all queries are made at runtime directly against mongo in 1 request or are fully satisified from a local cache)
  entities:
    // in development mode...
    (process.env.NODE_ENV === "development" && supagraph.dev) ||
    // or if the mongodb uri isnt set...
    !process.env.MONGODB_URI
      ? // for development we can keep entities in node-persist and share between connections
        memoryResolver({
          // name the database (in-memory/persisted on disk to .next dir)
          name: supagraph.name,
        })
      : // for production/production-like we want to query mongo for results...
        mongoResolver({
          // name the database (this defines the db name for mongodb - changing the name will create a new db)
          name: supagraph.name,
          // connect to mongodb
          client: getMongodb(
            // this obviously needs putting in an env
            process.env.MONGODB_URI
          ),
          // skip groupBy on time/block - each id is unique in this set of syncs (treat as mutable entities)
          mutable: supagraph.mutable,
        }),
  // set the default query to show in graphiql
  defaultQuery: supagraph.defaultQuery,
  // set cacheControl header on response
  headers: {
    "Cache-Control": `max-age=${supagraph.revalidate}, public, s-maxage=${supagraph.revalidate}, stale-while-revalidate=${supagraph.staleWhileRevalidate}`,
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
