// import tooling
import { Contract, BigNumber } from "ethers";
import {
  Store,
  Migration,
  addSync,
  getEngine,
  withDefault,
  processPromiseQueue,
  getMulticallContract,
  callMulticallContract,
} from "supagraph";
import { getAddress } from "ethers/lib/utils";
import { JsonRpcProvider } from "@ethersproject/providers";

// import locally defined config
import { config } from "@supagraph/config";

// import local types used here
import { DelegateEntity } from "@supagraph/types";

// construct the provider once
const L2Provider = new JsonRpcProvider(
  config.providers[withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)].rpcUrl
);

// mark as started after first run
let hasRunTxInit = false;
let hasRunBalanceInit = false;

// slice the range according to the provided limit
const createRanges = (input: unknown[], limit: number): unknown[][] => {
  // each current is a tuple containing from and to
  let output: unknown[][] = [];

  while (input.length) {
    output.push(input.splice(0, limit < input.length ? limit : input.length));
  }

  // return all ranges
  return output;
};

// Initiate the onTransaction handler
export const InitTransactionHandler = async (): Promise<Migration> => {
  // return handler to initialse the L2 onTransaction handler after initial sync
  return {
    chainId: 1,
    blockNumber: "latest",
    handler: async () => {
      // finish supagraphs log
      if (!hasRunTxInit && !hasRunBalanceInit) process.stdout.write("...");
      // log that migration is starting
      console.log(
        `\n\n--\n\nStartup one-time migration event to addSync a new listener to collect blocks after initial sync completes...${
          hasRunBalanceInit ? "\n\n--\n\n" : ""
        }`
      );
      // mark as ran
      hasRunTxInit = true;
      // add the sync after catchup
      await addSync({
        chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
        handlers: `${withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)}`,
        // process each transaction globally - we need to observe every value transfer for our delegates
        eventName: "onTransaction",
        // establish the point we want to start and stop syncing from
        startBlock: "latest",
        endBlock: withDefault(process.env.L2_MANTLE_END_BLOCK, "latest"),
        opts: {
          // set the mode as ephemeral to delete the sync between startups
          mode: "ephemeral",
          // collect receipts to gather gas usage
          collectTxReceipts: true,
        },
      });
    },
  };
};

// Initiate an L2 balance correction handler
export const InitBalances = async (): Promise<Migration> => {
  // get the current multicall contract (same address on L1 and L2 (and mainnet and goerli if we want to use this there))
  const multicall = await getMulticallContract(
    "0xcA11bde05977b3631167028862bE2a173976CA11",
    L2Provider
  );

  // return handler to correct any mistakes in the L2 balance handling
  return {
    chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
    blockNumber: "latest",
    handler: async (blockNumber: number) => {
      // finish supagraphs log
      if (!hasRunTxInit && !hasRunBalanceInit) process.stdout.write("...");
      // log that migration is starting
      console.log(
        `${
          hasRunTxInit ? "" : "\n"
        }\n--\n\nStartup one-time migration event to correct balances...\n\n--\n`
      );
      // place all discovered balances here prior to processing
      const balances = {};
      // retrieve engine to call db directly
      const engine = await getEngine();
      // batch 500 addresses at a time into a multicall3 req to check MNT balances
      const mntTokenContract = new Contract(
        "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
        ["function balanceOf(address _owner) view returns (uint256 balance)"],
        L2Provider
      );

      // clear the promiseQueue to prevent processing balance changes before withPromises
      engine.promiseQueue.splice(0, engine.promiseQueue.length);

      // pull all known delegates from the snapshot table
      const allDelegates = (await engine.db.get("delegate")) as Record<
        string,
        unknown
      >[];
      // record how many of these we're pulled from db
      const checkpointDelegatesStart = allDelegates.length;

      // take from the parent checkpoint and add to the batch to make sure we have everything covered
      engine.stage.checkpoints[
        engine.stage.checkpoints.length - 1
      ].keyValueMap.forEach((values) => {
        allDelegates.push(values[values.length - 1]);
      });

      // index all the delegates to get rid of dupes
      const indexed = allDelegates.reduce((all, value: { id: string }) => {
        all[value.id] = value;
        return all;
      }, {});

      // current checkpoint length
      const checkpointStart =
        engine.stage.checkpoints[engine.stage.checkpoints.length - 1]
          .keyValueMap.size;

      // check the parent checkpoint length
      const checkpointParentStart =
        engine.stage.checkpoints[engine.stage.checkpoints.length - 2]
          .keyValueMap.size;

      // group the delegates into batches of 250
      const batchedDelegates = createRanges(
        Object.values(indexed) as unknown[],
        250
      );

      // pull the balances in batches via multicall to reduce number of calls and to prevent exhausting gas limit
      await processPromiseQueue(
        batchedDelegates.map((batch) => async () => {
          // produce a set of balanceOf calls to check every addresses MNT balance (on l2)
          const calls = batch.map((item: { id: string }) => {
            return {
              contract: mntTokenContract,
              target: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000" as string,
              fns: [
                {
                  fn: "balanceOf",
                  args: [item.id as string],
                },
              ],
            };
          });
          // run all calls...
          const responses = await callMulticallContract(
            multicall,
            calls,
            // set blockHeight for the multiCall
            blockNumber
          );
          // place the balances for all users
          responses.map((response, index) => {
            // index all balances by address
            balances[(batch[index] as { id: string }).id] = response;
          });
        })
      );
      console.log("All balances retrieved at blockNumber", +blockNumber);

      // place the correct balances against the entities (to recalculate the votes) sequentially to avoid race conditions
      for (const delegate of Object.keys(balances)) {
        // load the entity for this delegate
        let entity = await Store.get<DelegateEntity>(
          "Delegate",
          getAddress(delegate)
        );

        // when delegation is set and not to burn address...
        if (
          entity.l2MntTo &&
          entity.l2MntTo !== "0x0000000000000000000000000000000000000000" &&
          // check if the recorded balance is correct
          (!BigNumber.from(entity.l2MntBalance || "0").eq(
            BigNumber.from(balances[delegate] || "0")
          ) ||
            entity.l2MntBalance === null ||
            typeof entity.l2MntBalance === "undefined")
        ) {
          // fetch current delegation - we correct votes here
          let toDelegate = await Store.get<DelegateEntity>(
            "Delegate",
            getAddress(entity.l2MntTo)
          );

          // set the correct values against the entities
          toDelegate.set(
            "votes",
            BigNumber.from(toDelegate.votes || "0")
              .sub(BigNumber.from(entity.l2MntBalance || "0"))
              .add(BigNumber.from(balances[delegate] || "0"))
          );
          toDelegate.set(
            "l2MntVotes",
            BigNumber.from(toDelegate.l2MntVotes || "0")
              .sub(BigNumber.from(entity.l2MntBalance || "0"))
              .add(BigNumber.from(balances[delegate] || "0"))
          );

          // if theres no balance this is a new delegate and we need to register the counts
          if (
            entity.l2MntBalance === null ||
            typeof entity.l2MntBalance === "undefined"
          ) {
            toDelegate.set(
              "delegatorsCount",
              BigNumber.from(toDelegate.delegatorsCount || "0").add(1)
            );
            toDelegate.set(
              "l2MntDelegatorsCount",
              BigNumber.from(toDelegate.l2MntDelegatorsCount || "0").add(1)
            );
          }

          // update the entity
          toDelegate = await toDelegate.save();

          // check for self delegation
          if (entity.id === toDelegate.id) {
            entity = toDelegate;
          }

          // set new balance
          entity.set("l2MntBalance", balances[delegate]);

          // save the balance
          entity = await entity.save();
        }
      }
      // count how big the checkpoint is now
      const checkpointEnd =
        engine.stage.checkpoints[engine.stage.checkpoints.length - 1]
          .keyValueMap.size;

      // log the result of the op
      console.log("\nAll delegate sums recalculated", {
        delegates: Object.keys(balances).length,
        fromDb: checkpointDelegatesStart,
        fromCheckpoint: checkpointParentStart,
        updatedEntries: checkpointEnd - checkpointStart,
      });
      // mark as ran
      hasRunBalanceInit = true;
    },
  };
};
