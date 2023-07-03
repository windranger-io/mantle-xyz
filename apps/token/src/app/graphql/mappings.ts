import {
  DelegateChangedHandler,
  DelegateVotesChangedHandler,
  TransferHandler,
} from "./syncs";

// export the complete supagraph configuration (sync & graph)
export const mappings = {
  // handler mappings
  handlers: {
    mantle: {
      Transfer: TransferHandler,
      DelegateChanged: DelegateChangedHandler,
      DelegateVotesChanged: DelegateVotesChangedHandler,
    },
  },
  // list of registered handler mappings
  register: [
    {
      chainId: 5,
      address: "0xc1dC2d65A2243c22344E725677A3E3BEBD26E604",
      startBlock: 9127688,
      handlers: "mantle",
    },
  ],
};

// mappings will define the syncs that are in-play -- these will be persisted in the Store and can be modified at runtime to (de)register factory deployed contracts

// export the mappings as default
export default mappings;
