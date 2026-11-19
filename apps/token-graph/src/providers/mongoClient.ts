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

// One connection per uri, shared by all callers
export const getMongodb = async (uri: string): Promise<MongoClient> => {
  if (!uri) {
    throw new Error("Please provide a monogo uri to proceed");
  }

  if (!clientPromise[uri]) {
    // Forget a failed attempt so the next call reconnects. Caching the rejected
    // promise and retrying immediately is what used to spin until OOM.
    clientPromise[uri] = new MongoClient(uri).connect().catch((err) => {
      delete clientPromise[uri];
      throw err;
    });
  }

  return clientPromise[uri];
};
