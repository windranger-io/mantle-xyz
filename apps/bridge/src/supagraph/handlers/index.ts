// Type the exported handlers map
import { Handlers } from "@mantle/supagraph";

// Import the handlers
import {
  FailedRelayedMessageHandler,
  RelayedMessageHandler,
} from "./messenger";
import {
  ETHDepositInitiatedHandler,
  ERC20DepositInitiatedHandler,
} from "./standardBridge";
import { StateBatchAppendedHandler } from "./stateCommitmentChain";

// Construct the handlers to register each contract against its handlers
export const handlers: Handlers = {
  // construct as a named group
  Messenger: {
    // eventName -> handler()
    RelayedMessage: RelayedMessageHandler,
    FailedRelayedMessage: FailedRelayedMessageHandler,
  },
  StandardBridge: {
    // eventName -> handler()
    ETHDepositInitiated: ETHDepositInitiatedHandler,
    ERC20DepositInitiated: ERC20DepositInitiatedHandler,
  },
  StateCommitmentChain: {
    // eventName -> handler()
    StateBatchAppended: StateBatchAppendedHandler,
  },
};
