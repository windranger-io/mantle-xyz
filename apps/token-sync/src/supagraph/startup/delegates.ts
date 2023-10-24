// get engine from supagraph to access db
import { getEngine } from "supagraph";

// feed all of the delegate data into the db's kv store
export const WarmupDelegates = async () => {
  // get the engine to manipulate the db store
  const engine = await getEngine();

  // printing to show we're not hanging...
  console.log("Get all delegates from db");

  // pull the full list of delegates - this will query for a snapshot on the immutable table and save it into the kv store
  try {
    // get unique entries held in the delegate collection
    const allDelegates =
      ((await engine.db.get("delegate")) as Record<string, unknown>[]) || [];

    // printing result
    console.log("Got all delegates:", allDelegates.length);

    // mark as warm (this will prevent going to db for missing values (assumes everything is already in cache))
    engine.warmDb = true;
  } catch {
    // if not found log that we're starting new (this state is handled internally)
    console.log("No delegates found, starting fresh db");
  }
};
