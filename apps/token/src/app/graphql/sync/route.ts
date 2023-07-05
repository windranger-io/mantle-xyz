// use addSync to add operations and sync to process them all in block/tx order
import { NextRequest, NextResponse } from "next/server";

// import the sync command
import { DB, Mongo, Stage, Store, sync } from "@mantle/supagraph";
import { getMongodb } from "@providers/mongoClient";

// import revalidation timings from config
import { supagraph } from "../config";

// import all sync handlers
import "../syncs";

// switch out the engine for development to avoid the mongo requirment locally
Store.setEngine({
  // name the connection
  name: supagraph.name,
  // db is dependent on state
  db:
    // in production/production like environments we want to store mutations to mongo otherwise we can store them locally
    process.env.NODE_ENV === "development" && supagraph.dev
      ? // connect store to in-memory/node-persist store
        DB.create({ kv: {}, name: supagraph.name })
      : // connect store to MongoDB
        Mongo.create({
          kv: {},
          name: supagraph.name,
          mutable: supagraph.mutable,
          client: getMongodb(process.env.MONGODB_URI!),
        }),
});

// expose the sync command on a route so that we can call it with a cron job
export async function GET(request: NextRequest) {
  // set the start stage of the sync ("events", "blocks", "transactions", "sort", "process")
  const start =
    (request.nextUrl.searchParams.get("start") as keyof typeof Stage) || false;
  // set the stop stage of the sync ("events", "blocks", "transactions", "sort", "process")
  const stop =
    (request.nextUrl.searchParams.get("stop") as keyof typeof Stage) || false;

  // all new events discovered from all sync operations detailed in a summary
  const summary = await sync({
    // where should we start and stop this run? (allowing for staggered runs to build up the cache before executing the final step (process))
    start,
    stop,
    // skip extra steps to get block details about the logs
    skipBlocks: true, // skip collecting blocks
    skipTransactions: true, // skip collecting txs
    skipOptionalArgs: true, // import slim version of { tx, block } to the handlers (without reading in the txs or the blocks)
  });

  // we don't need to sync more often than once per block - and if we're using vercel.json crons we can only sync 1/min
  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": `max-age=${supagraph.revalidate}, public, s-maxage=${supagraph.revalidate}, stale-while-revalidate=${supagraph.staleWhileRevalidate}`,
    },
  });
}
