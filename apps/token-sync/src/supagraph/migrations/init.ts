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

// mark as started after first run
let hasRunTxInit = false;
let hasRunBalanceInit = false;

// slice the range according to the provided limit
const createRanges = (input: unknown[], limit: number): unknown[][] => {
  // each current is a tuple containing from and to
  const output: unknown[][] = [];

  // split into ranges according to the limit (by taking limit items from the input)
  for (let i = 0; i < input.length; i += limit) {
    output.push(input.slice(i, i + limit));
  }

  // return all ranges
  return output;
};

// Initiate the onTransaction handler
export const InitTransactionHandler = async (): Promise<Migration> => {
  // return handler to initialse the L2 onTransaction handler after initial sync
  return {
    chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
    blockNumber: "latest",
    handler: async () => {
      // finish supagraphs log
      if (!hasRunTxInit && !hasRunBalanceInit) process.stdout.write("...");
      // log that migration is starting
      console.log(
        `${
          !hasRunBalanceInit ? "\n" : ""
        }\n--\n\nStartup one-time migration event to addSync a new listener to collect transactions on L2 after initial sync completes...`
      );
      // mark as ran
      hasRunTxInit = true;
      // add a sync after catchup to watch for all transactions - we want to keep spender balance up to date
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
      // check transfers on the nativeToken - these are logged when contracts spend EOAs native MNT tokens
      await addSync({
        chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
        // against the native token handlers
        handlers: "nativeTokenl2",
        // pick up abis from nativeTokenl2 abi group
        events: "nativeTokenl2",
        // use native MNT token address to gather events
        address: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
        // process each transaction globally - we need to observe every value transfer for our delegates
        eventName: "Transfer",
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
  // return handler to correct any mistakes in the L2 balance handling
  return {
    chainId: withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001),
    blockNumber: "latest",
    handler: async (blockNumber: number) => {
      // retrieve engine to call db directly
      const engine = await getEngine();

      // construct the provider once
      const L2Provider = new JsonRpcProvider(
        config.providers[
          withDefault(process.env.L2_MANTLE_CHAIN_ID, 5001)
        ].rpcUrl
      );

      // get the current multicall contract (same address on L1 and L2 (and mainnet and goerli if we want to use this there))
      const multicall = await getMulticallContract(
        "0xcA11bde05977b3631167028862bE2a173976CA11",
        L2Provider
      );

      // finish supagraphs log
      if (!hasRunTxInit && !hasRunBalanceInit) process.stdout.write("...");

      // log that migration is starting
      console.log(
        `${
          hasRunTxInit ? "" : "\n"
        }\n--\n\nStartup one-time migration event to correct L2 balances...\n\n--\n`
      );
      // place all discovered balances here prior to processing
      const balances = {};
      // rebalance all l2 balances
      const rebalanced = new Map<string, DelegateEntity>();

      // batch 500 addresses at a time into a multicall3 req to check MNT balances
      const mntTokenContract = new Contract(
        "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
        ["function balanceOf(address _owner) view returns (uint256 balance)"],
        L2Provider
      );

      // clear the promiseQueue to prevent processing balance changes before withPromises
      engine.promiseQueue.length = 0;

      // pull all known delegates from the snapshot table
      const allDelegates = ((await engine.db.get("delegate")) || []) as Record<
        string,
        unknown
      >[];
      // record how many of these we're pulled from db
      const checkpointDelegatesStart = allDelegates.length;

      console.log("All delegates at start:", checkpointDelegatesStart);

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
        200
      );

      // pull the balances in batches via multicall to reduce number of calls and to prevent exhausting gas limit
      await processPromiseQueue(
        batchedDelegates.map((batch) => async () => {
          // produce a set of balanceOf calls to check every addresses MNT balance (on l2)
          const calls = batch.map((item: { id: string }) => {
            return {
              contract: mntTokenContract,
              target: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
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
            // set blockHeight for the multicall
            blockNumber
          );
          // place the balances for all users
          responses.map((response, index) => {
            // index all balances by address
            balances[(batch[index] as { id: string }).id] = response;
          });
        }),
        50
      );

      console.log("All balances retrieved at blockNumber", +blockNumber);

      // place the correct balances against the entities (to recalculate the votes) sequentially to avoid race conditions
      for (const delegate of Object.keys(balances)) {
        // load the entity for this delegate
        let entity = rebalanced.has(delegate)
          ? rebalanced.get(delegate)
          : ({
              ...((
                await Store.get<DelegateEntity>(
                  "Delegate",
                  getAddress(delegate)
                )
              ).valueOf() || {}),
            } as DelegateEntity);

        // reset all values on entity
        if (!rebalanced.has(entity.id)) {
          // clear all values back to mnt and bit values
          entity.votes = BigNumber.from(entity.mntVotes || "0").add(
            BigNumber.from(entity.bitVotes || "0")
          );
          entity.delegatorsCount = BigNumber.from(
            entity.mntDelegatorsCount || "0"
          ).add(BigNumber.from(entity.bitDelegatorsCount || "0"));
          // clear back to 0 (and rebuild)
          entity.l2MntVotes = BigNumber.from("0");
          entity.l2MntDelegatorsCount = BigNumber.from("0");
          // set into rebalanced so that we dont clear it again
          rebalanced.set(entity.id, entity);
        }

        // run through everything and reassign true values
        if (
          entity.l2MntTo &&
          entity.l2MntTo !== "0x0000000000000000000000000000000000000000"
        ) {
          // fetch current delegation - we correct votes here
          const toDelegate =
            entity.l2MntTo === entity.id
              ? entity
              : rebalanced.has(entity.l2MntTo as string)
              ? rebalanced.get(entity.l2MntTo as string)
              : ({
                  ...((
                    await Store.get<DelegateEntity>(
                      "Delegate",
                      getAddress(entity.l2MntTo)
                    )
                  ).valueOf() || {}),
                } as DelegateEntity);

          // reset all values
          if (!rebalanced.has(entity.l2MntTo)) {
            // clear all values back to mnt and bit values
            toDelegate.votes = BigNumber.from(toDelegate.mntVotes || "0").add(
              BigNumber.from(toDelegate.bitVotes || "0")
            );
            toDelegate.delegatorsCount = BigNumber.from(
              toDelegate.mntDelegatorsCount || "0"
            ).add(BigNumber.from(toDelegate.bitDelegatorsCount || "0"));
            // clear back to 0 (and rebuild)
            toDelegate.l2MntVotes = BigNumber.from("0");
            toDelegate.l2MntDelegatorsCount = BigNumber.from("0");
            // set into rebalanced so that we dont clear it again
            rebalanced.set(entity.l2MntTo, toDelegate);
          }

          // set the correct values against the entities
          toDelegate.votes = BigNumber.from(toDelegate.votes || "0").add(
            BigNumber.from(balances[delegate] || "0")
          );
          toDelegate.l2MntVotes = BigNumber.from(
            toDelegate.l2MntVotes || "0"
          ).add(BigNumber.from(balances[delegate] || "0"));
          // add 1 to the counts
          toDelegate.delegatorsCount = BigNumber.from(
            toDelegate.delegatorsCount || "0"
          ).add(1);
          toDelegate.l2MntDelegatorsCount = BigNumber.from(
            toDelegate.l2MntDelegatorsCount || "0"
          ).add(1);

          // check for self delegation
          if (entity.id === entity.l2MntTo) {
            entity = toDelegate;
          }

          // // log course correction details
          // if (!BigNumber.from(entity.l2MntBalance || "0").eq(BigNumber.from(balances[delegate]))) {
          //   console.log(delegate, entity.l2MntBalance, "should be", BigNumber.from(balances[delegate]).toString());
          // }

          // set new balance
          entity.l2MntBalance = balances[delegate];

          // save the balance
          rebalanced.set(entity.id, entity);
        }
      }

      // run through the delegates again and check for incorrect vote values which need to be replaced with the correct entity values
      for (const delegate of Object.keys(balances)) {
        // load the entity for this delegate
        const entity = await Store.get<DelegateEntity>(
          "Delegate",
          getAddress(delegate)
        );
        // retrieve the corrosponding newEntity
        const newEntity = rebalanced.get(delegate);
        // when delegation is set and not to burn address...
        if (
          newEntity &&
          // check if the vote has changed on the newEntity
          (!BigNumber.from(entity.votes || "0").eq(
            BigNumber.from(newEntity.votes || "0")
          ) ||
            // record any voters new l2MntBalances so future handlers start working from the correct starting point
            (entity.l2MntTo &&
              entity.l2MntTo !== "0x0000000000000000000000000000000000000000" &&
              !BigNumber.from(entity.l2MntBalance || "0").eq(
                BigNumber.from(newEntity.l2MntBalance || "0")
              )))
        ) {
          // make the change
          entity.replace({
            ...newEntity,
            blockNumber,
          });
          // save the changes (with block/timestamp set to now)
          await entity.save();
        }
      }

      // check how big the checkpoint is now
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
