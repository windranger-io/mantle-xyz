import { MongoClient } from "mongodb";

// Add a global rejection-handler (hopefully this isnt triggered)
process.on("unhandledRejection", (err, promise) => {
  // eslint-disable-next-line no-console
  console.log(`Unhandled rejection (promise: ${promise}, reason: ${err})`);
});

// In development, use a global variable so that the connection is preserved
// across module reloads caused by HMR (Hot Module Replacement).
const globalWithMongoClientPromise = global as typeof globalThis & {
  mongoClientPromise?: Record<string, Promise<MongoClient>>;
};
const isDev = process.env.NODE_ENV === "development";
const clientPromise: Record<string, Promise<MongoClient>> = isDev
  ? (globalWithMongoClientPromise.mongoClientPromise ??= {})
  : {};

// Give up on server selection well before the function's maxDuration (30s), so an
// unreachable database surfaces as an error instead of a platform timeout. Only
// affects finding a server (connect/reconnect), not how long queries may run.
const SERVER_SELECTION_TIMEOUT_MS = 10_000;

// One connection per uri, shared by all callers (not async, so every caller
// gets this exact promise rather than a wrapper without a rejection handler)
export const getMongodb = (uri: string): Promise<MongoClient> => {
  if (!uri) {
    throw new Error("Please provide a monogo uri to proceed");
  }

  if (!clientPromise[uri]) {
    // Forget a failed attempt so the next call reconnects. Caching the rejected
    // promise and retrying immediately is what used to spin until OOM.
    clientPromise[uri] = new MongoClient(uri, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    })
      .connect()
      .catch((err) => {
        delete clientPromise[uri];
        throw err;
      });
    // Callers that keep the promise without awaiting it yet (e.g. the module-level
    // client passed to supagraph) must not turn a failed connect into an unhandled
    // rejection, which makes the Vercel runtime exit the process. Awaiting callers
    // still receive the error.
    clientPromise[uri].catch(() => {});
  }

  return clientPromise[uri];
};
