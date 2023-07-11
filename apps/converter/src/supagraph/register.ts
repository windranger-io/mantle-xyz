// Import configuration to setup registrations
import config from "./config";

// Import the handlers
import { TokensMigratedHandler } from "./handlers";

// Import Mappings to type the obj we will register
import type { Mappings } from "./types";

// Re-export the Mappings type
export type { Mappings } from "./types";

// Construct the mappings to register each contract against its handlers
export const mappings: Mappings = {
  // handler mappings
  handlers: {
    // construct as a named group
    migrator: {
      // eventName -> handler()
      TokensMigrated: TokensMigratedHandler,
    },
  },
  // list of registered handler mappings
  register: [
    {
      // map to grouped handlers
      handlers: "migrator",
      // extract the RPC url for the given chainID
      rpcUrl:
        config.providers[
          config.contracts.migrator.chainId as keyof typeof config.providers
        ].rpcUrl,
      // pull remainder of the config from the contract
      abi: config.contracts.migrator.events,
      address: config.contracts.migrator.address,
      startBlock: config.contracts.migrator.startBlock,
    },
  ],
};
