// import supagraph tooling
import { DB, Mongo, SyncConfig, sync, setEngine } from "supagraph";

// import mongo client factory
import { getMongodb } from "@providers/mongoClient";

// import local configuration and handlers
import { config } from "@supagraph/config";
import { handlers } from "@supagraph/handlers";

// import migration and warmup operations to feed into startup
import { startups } from "@supagraph/startup";
import { migrations } from "@supagraph/migrations";

// construct the sync call
const syncLogic = async () => {
  // Switch out the engine for development to avoid the mongo requirment locally
  const engine = await setEngine({
    // name the connection
    name: config.name,
    // db is dependent on state
    db:
      // in production/production like environments we want to store mutations to mongo otherwise we can store them locally
      !process.env.MONGODB_URI ||
      (process.env.NODE_ENV === "development" && config.dev)
        ? // connect store to in-memory/node-persist store
          DB.create({
            kv: {},
            name: config.name,
            reset: (config as unknown as SyncConfig)?.reset,
          })
        : // connect store to MongoDB
          Mongo.create({
            kv: {},
            name: config.name,
            mutable: config.mutable,
            client: getMongodb(process.env.MONGODB_URI!),
          }),
  });

  // await each of the startup operations
  for (const startup of startups) {
    await startup();
  }

  // all new events discovered from all sync operations detailed in a summary
  const summary = await sync({
    // insert config and handlers via sync (this will be merged with in memory syncs)
    config,
    handlers,
    // apply operations according to a cron schedule (applicable in listen-mode only)
    schedule: [
      {
        // @ half past on every hour - 30 */1 * * *
        // @ every 10 minutes (6 times per hour) - */10 * * * *
        expr: "*/10 * * * *",
        // stop execution and throw every 10 minutes to clear memory and run startup migrations again
        handler: () => {
          // mark as error to hit onError and terminate
          engine.error = "\n\nScheduled restart\n\n";
          // end process on the minute mark
          engine.close();
        },
      },
    ],
    // setup the imported migrations
    migrations: await migrations(),
    // construct error handler to exit the process on error
    onError: async (e, close) => {
      // log end of stream
      console.error("\n\n[LISTENER ERROR]: Listener has thrown - restart");
      // log the error that ended it
      console.error(e);
      // close the stream
      await close();
      // exit after we've finished here
      process.exit(1);
    },
  });

  // if an error is thrown (db locked) we can signal a halt to restart the server
  if (summary.error) throw summary.error;

  // print initial summary (this was the catchup sync - ongoing listen action will happen after this return)
  console.log(summary);
};

// export init method to catch, report and exit
export async function start() {
  try {
    // if something fails, we should stop the NODEJS process, this allows railway to restarts it
    // this can help with memory / garbage collection issues during long running processes and aid in self-recovery
    await syncLogic();
  } catch (err) {
    // something went wrong...
    console.error("[SERVER ERROR - STOP]:", err);
    // stop when the logic throws
    process.exit(1);
  }
}
