// We're exporting migrations as defined by supagraph here
import { Migration } from "supagraph";
// Init migrations are called on latest block after catch-up sync
import { InitBalances, InitTransactionHandler } from "./init";

// Construct Migrations in an array (we can have many migrations with the same block/chainId combination...)
export const migrations: () => Promise<Migration[]> = async () => [
  // work through the current set of delegates and recalculate the L2 balances
  await InitBalances(),
  // append onTransaction to start listening for L2 transactions to mark balance changes on delegates
  await InitTransactionHandler(),
];

// export on default
export default migrations;
