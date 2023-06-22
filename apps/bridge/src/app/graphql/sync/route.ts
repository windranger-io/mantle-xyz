// use addSync to add operations and sync to process them all in block/tx order
import { NextRequest, NextResponse } from "next/server";

// import the sync command
import { Stage, sync } from "@mantle/supergraph";

// import revalidation timings from config
import {
  SUPERGRAPH_REVALIDATE,
  SUPERGRAPH_STALE_WHILE_REVALIDATE,
} from "../config";

// import all sync handlers
import "../syncs";

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
    // where should we start and stop this run?
    start,
    stop,
    // skip extra steps to get block details about the logs
    skipBlocks: true, // skip collecting block
    skipTransactions: true, // skip collecting tx
    skipOptionalArgs: true, // import slim version of { tx, block } to the handlers
  });

  // we don't need to sync more often than once per block - and if we're using vercel.json crons we can only sync 1/min
  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": `max-age=${SUPERGRAPH_REVALIDATE}, public, s-maxage=${SUPERGRAPH_REVALIDATE}, stale-while-revalidate=${SUPERGRAPH_STALE_WHILE_REVALIDATE}`,
    },
  });
}
