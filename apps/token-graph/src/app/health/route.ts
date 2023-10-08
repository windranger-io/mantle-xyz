// Return a health check response on the /health route
import { NextResponse } from "next/server";

// Use config to id mongodb connection
import config from "@supagraph/config";
import { withDefault } from "supagraph";

// Import client generator
import { getMongodb } from "@providers/mongoClient";

// Generate client
const client = getMongodb(process.env.MONGODB_URI!);

// Expose a post handler to accept api-v2 type strategy reqs from snapshot
export async function GET() {
  // check for uri before connecting
  if (process.env.MONGODB_URI && client) {
    // fetch the db connection
    const mongo = (await client).db(config.name || "supagraph");

    // connect to the entity collection
    const collection = mongo.collection("__meta__");

    // query directly from mongo to save cycles (this doesnt need to be a graphql query)
    const result = collection.aggregate([
      // limit the results to those left of the snapshot
      {
        $match: {
          $or: [
            {
              id: withDefault(process.env.MANTLE_CHAIN_ID, "5"),
            },
            {
              id: withDefault(process.env.L2_MANTLE_CHAIN_ID, "5001"),
            },
          ],
        },
      },
    ]);

    // await the results
    const latestSyncs = await result.toArray();

    // check that the most recent block handled was emitted in the last 1 minute (L2 chain should update this value every block)
    const isInSync = latestSyncs.reduce((inSync: boolean, sync) => {
      if (sync.latestBlockTime + 60 >= new Date().getTime() / 1000) {
        return true;
      }
      return inSync;
    }, false);

    // return the requested scores for the requested users
    return NextResponse.json(
      {
        status: isInSync ? "OK" : "ERROR",
        ...(isInSync
          ? {}
          : {
              error: "Sync has fallen more than 1 minute out-of-sync",
            }),
      },
      {
        headers: {
          // allow to be cached for 60 seconds and allow caching in shared public cache
          "Cache-Control": `max-age=60, public, s-maxage=60`,
        },
      }
    );
  }
}
