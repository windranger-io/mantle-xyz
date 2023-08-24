// type the handlers
import { Handlers } from "supagraph";

// Import the handlers
import {
  TransferHandler,
  DelegateChangedHandler,
  DelegateVotesChangedHandler,
} from "./token";

// Construct the handlers to register each contract against its handlers
export const handlers: Handlers = {
  // construct as a named group
  token: {
    // eventName -> handler()
    Transfer: TransferHandler,
    DelegateChanged: DelegateChangedHandler,
    DelegateVotesChanged: DelegateVotesChangedHandler,
  },
};
