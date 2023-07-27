import { NextResponse } from "next/server";

// Import mongodb client
import { DB, Mongo, Store, getEngine } from "@mantle/supagraph";
import { getMongodb } from "@providers/mongoClient";
import { MongoClient } from "mongodb";

// Import the current configuration
import config from "@supagraph/config";

// Supagraph components for claims
import { claim } from "@supagraph/handlers/claim";
import { L1ToL2MessageEntity } from "@supagraph/types";

// forces the route handler to be dynamic
export const dynamic = "force-dynamic";

// Switch out the engine for development to avoid the mongo requirment locally
Store.setEngine({
  // name the connection
  name: config.name,
  // db is dependent on state
  db:
    // in production/production like environments we want to store mutations to mongo otherwise we can store them locally
    process.env.NODE_ENV === "development" && config.dev
      ? // connect store to in-memory/node-persist store
        DB.create({ kv: {}, name: config.name })
      : // connect store to MongoDB
        Mongo.create({
          kv: {},
          client: getMongodb(process.env.MONGODB_URI!),
          name: config.name,
          mutable: config.mutable,
        }),
});

// Pull any drops that have been missed (we know these are missed because the first bridge should always has gasDropped: true)
const getMissedDrops = async (db: ReturnType<MongoClient["db"]>) => {
  // query for missed gas drops (groupby $from taking the first deposit only then check gasDropped for that "from" on subsequent deposits)
  return db.collection("l1ToL2Message").aggregate<{
    _id: string;
    id: string;
    from: string;
    gasDropped: boolean;
  }>(
    [
      {
        $sort: {
          l1BlockNumber: 1,
        },
      },
      {
        $group: {
          _id: "$from",
          id: { $first: "$id" },
          from: { $first: "$from" },
          gasDropped: { $first: "$gasDropped" },
        },
      },
      {
        $lookup: {
          from: "l1ToL2Message",
          let: {
            joinOn: "$from",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$from", "$$joinOn"],
                },
                gasDropped: true,
              },
            },
          ],
          as: "alreadyDropped",
        },
      },
      {
        $project: {
          id: 1,
          from: 1,
          gasDropped: 1,
          count: {
            $size: "$alreadyDropped",
          },
        },
      },
      {
        $match: {
          gasDropped: null,
          count: {
            $eq: 0,
          },
        },
      },
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );
};

// mark as dropped
const markDrop = async (tx: { id: string }) => {
  // clear chainId and block to skip ts updates
  Store.setChainId(0);
  Store.clearBlock();
  // issue the gasDrop
  const message = await Store.get<L1ToL2MessageEntity>(
    "L1ToL2Message",
    tx.id,
    // we don't care what state it holds...
    true
  );
  // mark that gas was dropped
  message.set("gasDropped", true);
  // save the changes
  await message.save();

  return true;
};

// Process any drops that have been missed between operations
const processMissedDrops = async (
  missed: {
    from: string;
    id: string;
  }[]
) => {
  return Promise.all(
    missed.map(async (tx) => {
      // add a gas-drop claim for the sender
      return (
        claim(tx.from)
          .then(async (result: any) => {
            // so long as the claim hasn't errored (alredy claimed etc...)
            if (
              !result?.error ||
              result.error?.meta?.target === "ClaimCode_code_key"
            ) {
              // log in stdout
              // eslint-disable-next-line no-console
              console.log(
                `Gas-drop created for ${result?.data?.reservedFor || tx.from}`
              );
              // issue the gasDrop
              return markDrop(tx);
            }
            // mark as failed
            return false;
          })
          // noop any errors
          .catch(() => false)
      );
    })
  );
};

// Expose the sync command on a route so that we can call it with a cron job
export async function GET() {
  // open a checkpoint on the db...
  const engine = await getEngine();

  // select the named db
  const db = engine?.db as Mongo;

  // if we have a db
  if (db.db) {
    // create a checkpoint
    engine?.stage?.checkpoint();

    // pull the missed drops
    const result = await getMissedDrops(await Promise.resolve(db.db));
    const missed = await result.toArray();

    // process the missed claims
    const claimed = await processMissedDrops(missed);

    // write all updates to db
    await engine?.stage?.commit();

    // we don't need to sync more often than once per block - and if we're using vercel.json crons we can only sync 1/min - 1/10mins seems reasonable for this
    return NextResponse.json(
      {
        missed: missed.length,
        claimed: claimed.filter((v) => v).length,
      },
      {
        headers: {
          // allow to be cached for revalidate seconds and allow caching in shared public cache (upto revalidate seconds)
          "Cache-Control": `max-age=${config.revalidate}, public, s-maxage=${config.revalidate}`,
        },
      }
    );
  }

  return NextResponse.json(
    {
      error: "no db",
    },
    {
      headers: {
        // allow to be cached for revalidate seconds and allow caching in shared public cache (upto revalidate seconds)
        "Cache-Control": `max-age=${config.revalidate}, public, s-maxage=${config.revalidate}`,
      },
    }
  );
}
