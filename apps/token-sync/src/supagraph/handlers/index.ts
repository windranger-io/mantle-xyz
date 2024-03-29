// type the handlers
import { Handlers, getEngine, withDefault } from "supagraph";

// Import the handlers
import {
  TransferHandler,
  TransactionHandler,
  TransactionHandlerPostProcessing,
} from "./network";
import {
  DelegateChangedHandler,
  DelegateChangedHandlerPostProcessing,
  DelegateVotesChangedHandler,
} from "./token";
import {
  Block,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { BigNumber } from "ethers";

// mark when the withPromises is ran for the first time (initial sync)
let hasRun = false;

// Construct the handlers to register each contract against its handlers
export const handlers: Handlers = {
  // construct handlers for the network level events (withDefault will parse numerics)
  [withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)]: {
    // eventName -> handler()
    onTransaction: TransactionHandler,
  },
  nativeTokenl2: {
    Transfer: TransferHandler,
  },
  tokenl1: {
    // eventName -> handler()
    DelegateChanged: DelegateChangedHandler,
    DelegateVotesChanged: DelegateVotesChangedHandler,
  },
  tokenl2: {
    // eventName -> handler()
    DelegateChanged: DelegateChangedHandler,
  },
  // we're using "internal" to hold `withPromises` - any group can hold a `withPromises` handler - each will be supplied the full promiseQueue when called
  internal: {
    // post event handled after all events in sync have been ran
    withPromises: async (queue: Promise<unknown>[]) => {
      // on first-run we noop the promise queue because it contains only balance-updates which will have already been correctly placed by the init-Balances migration handler
      if (!hasRun) {
        // ignore the promiseQueue and end the process update
        process.stdout.write("\n--\n\nEvents processed ");
        // mark as ran - for all future encounters we want to process the items to accept balance transfers...
        hasRun = true;
      } else {
        // process the sorted updates sequentially
        for (const item of queue) {
          try {
            // process *Handler types in the order they we're stacked into the queue
            if (
              ((await item) as { type: string }).type ===
              "DelegateChangedHandler"
            ) {
              await DelegateChangedHandlerPostProcessing(
                (await item) as {
                  tx: TransactionReceipt & TransactionResponse;
                  block: Block;
                  delegator: string;
                  fromDelegate: string;
                  toDelegate: string;
                  newBalance: BigNumber;
                }
              );
            } else if (
              ((await item) as { type: string }).type === "TransactionHandler"
            ) {
              await TransactionHandlerPostProcessing(
                (await item) as {
                  tx: TransactionReceipt & TransactionResponse;
                  block: Block;
                  delegator: string;
                  newBalance: BigNumber;
                  direction: number;
                }
              );
            }
          } catch (e) {
            console.log("Processing error", e);
          }
        }
      }
    },
  },
};

// export handlers as default
export default handlers;
