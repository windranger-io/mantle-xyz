// Import configuration to setup registrations
import config from "./config";

// Import the handlers
import {
  TransferHandler,
  DelegateChangedHandler,
  DelegateVotesChangedHandler,
} from "./handlers";

// Import Mappings to type the obj we will register
import type { Mappings } from "./types";

// Re-export the Mappings type
export type { Mappings } from "./types";

// Construct the mappings to register each contract against its handlers
export const mappings: Mappings = {
  // handler mappings
  handlers: {
    // construct as a named group
    token: {
      // eventName -> handler()
      Transfer: TransferHandler,
      DelegateChanged: DelegateChangedHandler,
      DelegateVotesChanged: DelegateVotesChangedHandler,
    },
  },
  // list of registered handler mappings
  register: [
    {
      // map to grouped handlers
      handlers: "token",
      // extract the RPC url for the given chainID
      rpcUrl:
        config.providers[
          config.contracts.mantle.chainId as keyof typeof config.providers
        ].rpcUrl,
      // pull remainder of the config from the contract
      abi: config.contracts.mantle.events,
      address: config.contracts.mantle.address,
      startBlock: config.contracts.mantle.startBlock,
    },
    {
      // map to grouped handlers
      handlers: "token",
      // extract the RPC url for the given chainID
      rpcUrl:
        config.providers[
          config.contracts.bitdao.chainId as keyof typeof config.providers
        ].rpcUrl,
      // pull remainder of the config from the contract
      abi: config.contracts.bitdao.events,
      address: config.contracts.bitdao.address,
      startBlock: config.contracts.bitdao.startBlock,
    },
  ],
};
