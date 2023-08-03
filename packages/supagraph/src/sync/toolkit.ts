/* eslint-disable no-console, no-multi-assign, no-await-in-loop, no-restricted-syntax, no-param-reassign, no-underscore-dangle */
import fs from "fs";

// Build Event filters with ethers
import { ethers, providers } from "ethers";
import {
  Block,
  BaseProvider,
  TransactionReceipt,
} from "@ethersproject/providers";
import { getAddress } from "ethers/lib/utils";

// Parse and write csv documents (using csv incase we have to move processing into readStreams)
import csvParser from "csv-parser";
import csvWriter from "csv-write-stream";

// Create new entities against the engine via the Store
import { Entity, Store, getEngine } from "./store";

// Allow for stages to be skipped via config
export enum Stage {
  events = 1,
  blocks,
  transactions,
  sort,
  process,
}

// Define a sync op
export type Sync = {
  eventName: string;
  address: string;
  provider: BaseProvider;
  startBlock: number;
  eventAbi: ethers.Contract["abi"];
  onEvent: (
    args: any,
    {
      tx,
      block,
      logIndex,
    }: { tx: TransactionReceipt; block: Block; logIndex: number }
  ) => void;
  opts?: {
    collectTxReceipts: boolean;
  };
};

// Handlers definition, to map handlers to contracts
export type Handlers = {
  [key: string]: {
    [key: string]: (
      args: any,
      {
        tx,
        block,
        logIndex,
      }: {
        tx: providers.TransactionReceipt;
        block: providers.Block;
        logIndex: number;
      }
    ) => void;
  };
};

// how many ranges to request at a time
const CONCURRENCY = 10;

// the maximum no. of blocks to be attempted in any one queryFilter call
const RANGE_LIMIT = 100000;

// working directory of the calling project or tmp if in prod
const cwd =
  process.env.NODE_ENV === "development"
    ? `${process.cwd()}/data/`
    : "/tmp/data"; // we should use /tmp/ on prod for an ephemeral store during the execution of this process (max 512mb of space)

// sync operations will be appended in the route.ts file using addSync
const syncs: Sync[] = [];

// list of public rpc endpoints
const altProviders: Record<number, string[]> = {
  1: [
    `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    `https://rpc.ankr.com/eth`,
  ],
  5: [
    `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    `https://ethereum-goerli.publicnode.com`,
    `https://eth-goerli.public.blastapi.io`,
    `https://rpc.goerli.eth.gateway.fm`,
    `https://rpc.ankr.com/eth_goerli`,
  ],
  5000: [`https://rpc.mantle.xyz`],
  5001: [`https://rpc.testnet.mantle.xyz`],
};

// set the default RPC providers
const rpcProviders: Record<
  number,
  Record<number, providers.JsonRpcProvider>
> = {
  1: {
    0: new providers.JsonRpcProvider(altProviders[1][0]),
  },
  5: {
    0: new providers.JsonRpcProvider(altProviders[5][0]),
  },
  5000: {
    0: new providers.JsonRpcProvider(altProviders[5000][0]),
  },
  5001: {
    0: new providers.JsonRpcProvider(altProviders[5001][0]),
  },
};

// function to return a provider from the alt list
const getRandomProvider = (chainId: number) => {
  const key = Math.floor(Math.random() * altProviders[chainId].length);
  rpcProviders[chainId][key] =
    rpcProviders[chainId][key] ||
    new providers.JsonRpcProvider(altProviders[chainId][key]);
  return rpcProviders[chainId][key];
};

// allow external usage to set the sync operations
export function addSync<T extends Record<string, unknown>>(
  eventNameOrParams:
    | string
    | {
        eventName: string;
        address: string;
        provider: BaseProvider;
        startBlock: number;
        eventAbi: ethers.Contract["abi"];
        onEvent: (
          args: T,
          {
            tx,
            block,
            logIndex,
          }: { tx: TransactionReceipt; block: Block; logIndex: number }
        ) => void;
        opts?: {
          collectTxReceipts: boolean;
        };
      },
  provider?: BaseProvider,
  startBlock?: number,
  address?: string,
  eventAbi?: ethers.Contract["abi"],
  onEvent?: (
    args: T,
    {
      tx,
      block,
      logIndex,
    }: { tx: TransactionReceipt; block: Block; logIndex: number }
  ) => void,
  opts?: {
    collectTxReceipts: boolean;
  }
): (
  args: T,
  {
    tx,
    block,
    logIndex,
  }: { tx: TransactionReceipt; block: Block; logIndex: number }
) => void {
  let params;

  // hydrate the params
  if (typeof eventNameOrParams === "string") {
    params = {
      address: address!,
      eventAbi: eventAbi!,
      eventName: eventNameOrParams!,
      onEvent: onEvent!,
      provider: provider!,
      startBlock: startBlock!,
      opts: opts || { collectTxReceipts: false },
    };
  } else {
    params = eventNameOrParams;
  }

  // push to the syncs
  syncs.push(params);

  // Return the event handler to constructing context
  return params.onEvent;
}

// slice the range into 100,000 block units
const createBlockRanges = (
  fromBlock: number,
  toBlock: number,
  limit: number
): number[][] => {
  // each current is a tuple containing from and to
  let currentRange: number[] = [fromBlock];
  // we collect the tuples into an array
  const blockRanges: number[][] = [];

  // bracket the from and to to only include the limit number of blocks
  for (let i = fromBlock + 1; i <= toBlock; i += 1) {
    // if we step over the limit push a new entry
    if (i - currentRange[0] >= limit) {
      // -1 so we don't request the same block twice
      currentRange.push(i - 1);
      blockRanges.push(currentRange);
      // start the next range at boundary
      currentRange = [i];
    }
  }

  // push the final toBlock to the current range
  currentRange.push(toBlock);
  // record the final current range
  blockRanges.push(currentRange);

  // return all ranges
  return blockRanges;
};

// collect events from the given range
const eventsFromRange = async (
  chainId: number,
  contract: ethers.Contract,
  event: string,
  fromBlock: number,
  toBlock: number,
  reqStack: (() => Promise<any>)[],
  result: Set<ethers.Event>
) => {
  // use catch to check for error state and collect range by halfing if we exceed 10000 events
  const res: ethers.Event[] = await new Promise<ethers.Event[]>(
    (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Query timeout exceeded"));
      }, 6000);

      // run the queryFilter
      contract
        .queryFilter(contract.filters[event](), fromBlock, toBlock)
        .then((results) => {
          clearTimeout(timer);
          resolve(results);
        })
        .catch((e) => {
          clearTimeout(timer);
          reject(e);
        });
    }
  ).catch(async (e) => {
    reqStack.push(async () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await cancelAndSplit(
        chainId,
        contract,
        event,
        fromBlock,
        toBlock,
        reqStack,
        result
      )(e);
    });
    // split the req and try again
    return [];
  });

  if (res.length) {
    // log what we've collected on this tick
    console.log(
      `Got ${
        res.length
      } ${event}::${chainId} events from range: ${JSON.stringify({
        fromBlock,
        toBlock,
      })}`
    );

    // add each item to the result
    res.forEach((resEvent) => {
      result.add({
        ...resEvent,
      } as ethers.Event);
    });
  }
};

// cancel this frame and split the range in two to reattempt the call
const cancelAndSplit =
  (
    chainId: number,
    contract: ethers.Contract,
    event: string,
    fromBlock: number,
    toBlock: number,
    reqStack: (() => Promise<any>)[],
    result: Set<ethers.Event>
  ) =>
  async (e: any) => {
    // connection timeout - reattempt the same range
    if (e.code === "TIMEOUT" || e.code === "NETWORK_ERROR") {
      await eventsFromRange(
        chainId,
        contract,
        event,
        fromBlock,
        toBlock,
        reqStack,
        result
      );
    } else if (
      toBlock - fromBlock > 1 &&
      // check the error code
      ([
        // processing response error
        "-32002",
        // check for 10000 limit (this is infura specific - we have a 10,000 event limit per req)
        "-32005",
        // if there is a server error, its probably because the range is too large
        "SERVER_ERROR",
      ].includes(e.code) ||
        e.message === "Query timeout exceeded")
      // API rate limit exceeded
    ) {
      // split the range in two and try again...
      const middle = Math.round((fromBlock + toBlock) / 2);
      // result was limited, detail what happend...
      // console.log(
      //   ` - failed getting ${event}::${chainId} - splitting req [${fromBlock} ... ${toBlock}] -> [${fromBlock} ... ${
      //     middle - 1
      //   }] and [${middle + 1} ... ${toBlock}]`
      // );

      // get events from two ranges and bubble the result (this will combine all results recursively and add blocks)
      await Promise.all([
        eventsFromRange(
          chainId,
          contract,
          event,
          fromBlock,
          middle,
          reqStack,
          result
        ),
        eventsFromRange(
          chainId,
          contract,
          event,
          middle + 1,
          toBlock,
          reqStack,
          result
        ),
      ]);
    } else {
      console.log("Failed unknown error", e);
    }
  };

// wrap the events response to set and to cast type
const wrapEventRes = async (
  event: string,
  entries: ethers.Event[],
  provider: BaseProvider,
  collectTxReceipt: boolean
) => {
  return Promise.all(
    entries.map(async (entry) => {
      return {
        type: event,
        data: entry,
        chainId: (await provider.getNetwork()).chainId,
        collectTxReceipt,
      };
    })
  );
};

// pull new events from the contract contract
const getNewEvents = async (
  address: string | undefined,
  eventAbi: ethers.Contract["abi"] | undefined,
  eventName: string,
  fromBlock: number,
  toBlock: number,
  provider: BaseProvider,
  collectTxReceipt: boolean
): Promise<
  {
    type: string;
    data: ethers.Event;
    chainId: number;
    collectTxReceipt: boolean;
  }[]
> => {
  // collect a list of events then map the event type to each so that we can rebuild all events into a single array later
  const result = new Set<ethers.Event>();
  // get the chainId
  const { chainId } = await provider.getNetwork();
  // only proceed if the contract is known...
  if (address && eventAbi) {
    // connect to contract and filter for events to build data-set
    const contract = new ethers.Contract(address, eventAbi, provider);
    // create a new eventRange for each 500,000 blocks (to process in parallel)
    const ranges = createBlockRanges(fromBlock, toBlock, RANGE_LIMIT);
    // construct a reqStack so that we're only processing x reqs at a time
    const reqStack: (() => Promise<any>)[] = [];

    // iterate the ranges and collect all events in that range
    for (const [from, to] of ranges) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      reqStack.push(async () => {
        // what if result is just built by ref? then we dont have to await failures etc...
        await eventsFromRange(
          chainId,
          contract,
          eventName,
          from,
          to,
          reqStack,
          result
        );
      });
    }

    // pull from the reqStack and process...
    while (reqStack.length > 0) {
      // process n requests concurrently and wait for them all to resolve
      const consec = reqStack.splice(0, CONCURRENCY);
      // run through all promises until we come to a stop
      await Promise.all(
        consec.map(async (func) => {
          return func();
        })
      );
    }
  }

  // wrap the events with the known type
  return wrapEventRes(
    eventName,
    Array.from(result),
    provider,
    collectTxReceipt
  );
};

// read the file from disk
const readJSON = async <T extends Record<string, any>>(
  type: string,
  filename: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${cwd}${type}-${filename}.json`, "utf8", async (err, file) => {
      if (!err && file && file.length) {
        const data = JSON.parse(file);
        resolve(data as T);
      } else {
        reject(err);
      }
    });
  });
};

// save a JSON data blob to disk
const saveJSON = async (
  type: string,
  filename: string,
  resData: Record<string, unknown>
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // write the file
    fs.writeFile(
      `${cwd}${type}-${filename}.json`,
      JSON.stringify(resData),
      "utf8",
      async (err) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      }
    );
  });
};

// this is only managing about 20k blocks before infura gets complainee
const attemptFnCall = async <T extends Record<string, any>>(
  type: string,
  dets: {
    type: string;
    data: ethers.Event;
    chainId: number;
    timestamp?: number;
    from?: string;
  },
  prop: keyof ethers.Event,
  fn: "getBlock" | "getTransactionReceipt",
  resProp: "timestamp" | "from",
  attempts: number
) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Query timeout exceeded::attemptFnCall"));
    }, 6000);

    // attempt to get the block from the connected provider first
    (attempts === 0
      ? (rpcProviders[dets.chainId][0][fn](
          dets.data[prop] as string
        ) as unknown as Promise<T>)
      : (getRandomProvider(dets.chainId)[fn](
          dets.data[prop] as string
        ) as unknown as Promise<T>)
    )
      .then((resData: T) => {
        clearTimeout(timer);
        // write the file
        saveJSON(type, `${dets.chainId}-${dets.data[prop]}`, resData);
        // set the value by mutation
        dets[resProp] = resData[resProp as unknown as keyof T];
        // resolve the requested data
        resolve(resData);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
};

// unpack event fn details for prop
const getFnResultForProp = async <T extends Record<string, any>>(
  events: {
    type: string;
    data: ethers.Event;
    chainId: number;
    timestamp?: number;
    from?: string;
  }[],
  type: string,
  prop: keyof ethers.Event,
  fn: "getBlock" | "getTransactionReceipt",
  resProp: "timestamp" | "from"
) => {
  // place the operations into a stack and resolve them x at a time
  const reqStack: (() => Promise<unknown>)[] = [];

  // iterate the events and attempt to pull the associated block/transaction
  for (const dets of events) {
    // push function to place the selected resProp at the requested prop
    reqStack.push(() =>
      new Promise<unknown>((resolve, reject) => {
        fs.readFile(
          `${cwd}${type}-${dets.chainId}-${dets.data[prop]}.json`,
          "utf8",
          async (err, file) => {
            if (!err && file && file.length) {
              const data = JSON.parse(file);
              dets[resProp] = data[resProp as unknown as keyof T];
              resolve(data);
            } else {
              attemptFnCall<T>(type, dets, prop, fn, resProp, 0)
                .then((respType) => {
                  resolve(respType);
                })
                .catch((errType) => {
                  reject(errType);
                });
            }
          }
        );
      }).catch(
        (function retry(attempts) {
          // logging if we keep attempting and we're not getting anything...
          if (attempts % 10 === 0) {
            console.log(
              `Made 10 attempts to get: ${dets.chainId}::${dets.data[prop]}`
            );
          }

          // return the error handler (recursive stacking against the reqStack)
          return (): void => {
            reqStack.push(() =>
              attemptFnCall<T>(type, dets, prop, fn, resProp, attempts).catch(
                retry(attempts + 1)
              )
            );
          };
        })(1)
      )
    );
  }

  // pull from the reqStack and process...
  while (reqStack.length > 0) {
    const consec = reqStack.splice(0, CONCURRENCY);
    // run through all promises until we come to a stop
    await Promise.all(
      consec.map(async (func) => {
        return func();
      })
    );
  }

  // after resolution of all entries
  console.log(`--\n\nAll ${type} collected\n`);
};

// read a csv file of events
const readCSV = async (
  filePath: string
): Promise<
  {
    type: string;
    data: ethers.Event;
    chainId: number;
    collectTxReceipt: boolean;
    timestamp?: number;
    from?: string;
  }[]
> => {
  const results: {
    type: string;
    data: ethers.Event;
    chainId: number;
    collectTxReceipt: boolean;
    timestamp?: number;
    from?: string;
  }[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        if (data[0] !== "type") {
          results.push({
            type: data.type,
            data: {
              blockNumber: parseInt(data.blockNumber, 10),
              blockHash: data.blockHash,
              transactionIndex: parseInt(data.transactionIndex, 10),
              removed: data.removed === "true",
              address: data.address,
              data: data.data,
              topics: data.topics?.split(",") || [],
              transactionHash: data.transactionHash,
              logIndex: parseInt(data.logIndex, 10),
              event: data.event,
              eventSignature: data.eventSignature,
              args: data.args?.split(",") || [],
            } as ethers.Event,
            collectTxReceipt: data.collectTxReceipt === "true",
            chainId: parseInt(data.chainId, 10),
            timestamp: data.blockTimestamp,
            from: data.from,
          });
        }
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

// save events to csv file
const saveCSV = async (
  csvFileName: string,
  events: {
    type: string;
    data: ethers.Event;
    chainId: number;
    collectTxReceipt: boolean;
    timestamp?: number;
    from?: string;
  }[]
) => {
  // createWriteStream to save this run of raw events to a file
  const writableStream = fs.createWriteStream(csvFileName);

  // set up the csv document
  const writer = csvWriter({
    sendHeaders: true,
    headers: [
      "type",
      "collectTxReceipt",
      "blockTimestamp",
      "blockNumber",
      "blockHash",
      "transactionIndex",
      "removed",
      "address",
      "data",
      "topics",
      "transactionHash",
      "logIndex",
      "event",
      "eventSignature",
      "args",
      "from",
      "chainId",
    ],
  });

  // write to a new document each run
  const savingProcess = new Promise((resolve) => {
    writer.pipe(writableStream).on("finish", () => resolve(true));
  });

  // stream writes to the csv document
  events.forEach(
    (event: {
      type: string;
      data: ethers.Event;
      chainId: number;
      collectTxReceipt: boolean;
      timestamp?: number;
      from?: string;
    }) => {
      writer.write({
        type: event.type,
        collectTxReceipt: event.collectTxReceipt,
        blockTimestamp: event.timestamp,
        blockNumber: event.data.blockNumber,
        blockHash: event.data.blockHash,
        transactionIndex: event.data.transactionIndex,
        removed: event.data.removed,
        address: event.data.address,
        data: event.data.data,
        topics: event.data.topics,
        transactionHash: event.data.transactionHash,
        logIndex: event.data.logIndex,
        event: event.data.event,
        eventSignature: event.data.eventSignature,
        args: event.data.args,
        from: event.from,
        chainId: event.chainId,
      });
    }
  );

  // close the stream
  writer.end();

  // wait for the process to complete
  await savingProcess;
};

// sync all events since last sync operation
export const sync = async ({
  start = false,
  stop = false,
  skipBlocks = false,
  skipTransactions = false,
  skipOptionalArgs = false,
}: {
  start?: keyof typeof Stage | false;
  stop?: keyof typeof Stage | false;
  skipBlocks?: boolean;
  skipTransactions?: boolean;
  skipOptionalArgs?: boolean;
} = {}) => {
  // record when we started this operation
  const startTime = performance.now();

  // detect newDBs and mark locally
  let newDb = false;

  // open a checkpoint on the db...
  const engine = await getEngine();

  // set the engine against the db
  if (engine.db) {
    engine.db.engine = engine as { newDb: boolean };
  }

  // fetch the latest block once per chain
  const latestBlock: Record<string, Block> = {};
  const latestEntity: Record<
    string,
    Entity<{
      id: string;
      locked: boolean;
      lockedAt: number;
      latestBlock: number;
      _block_num: number;
      _block_ts: number;
    }> & {
      id: string;
      locked: boolean;
      lockedAt: number;
      latestBlock: number;
      _block_num: number;
      _block_ts: number;
    }
  > = {};

  // collect callbacks from the syncs
  const callbacks: Record<
    string,
    (
      args: any,
      {
        tx,
        block,
        logIndex,
      }: { tx: TransactionReceipt; block: Block; logIndex: number }
    ) => void | Promise<void>
  > = {};

  // collect each events abi iface
  const eventIfaces: Record<string, ethers.utils.Interface> = {};
  const startBlocks: Record<string, number> = {};
  const startTimes: Record<string, number> = {};

  // boolean to allow the lock to pass
  let clearLock = false;

  // record locks by chainId
  const locked: Record<number, boolean> = {};
  const blocked: Record<number, number> = {};

  // chainIds visited in the process
  const chainIds: Set<number> = new Set<number>();

  // collate all events from all sync operations
  let events: {
    type: string;
    data: ethers.Event;
    chainId: number;
    collectTxReceipt: boolean;
    timestamp?: number;
    from?: string;
  }[] = [];

  // sorted has same type as events
  let sorted: typeof events = [];

  // we're starting the process here then print the discovery
  if (!start || (start && Stage[start] < Stage.process)) {
    // detail everything which was loaded in this run
    console.log("\n\nStarting sync by collecting events...\n");
  }

  // collect events from each of the listed sync operations
  for (const opSync of syncs) {
    // hydrate the events into this var
    let newEvents: any;

    // extract info from the sync operation
    const {
      address,
      eventAbi,
      eventName,
      provider,
      startBlock,
      opts,
      onEvent,
    } = opSync;
    // get this chains id
    const { chainId } = await provider.getNetwork();

    // record the chainId
    chainIds.add(chainId);

    // check locked state - we only want to check this lock once per chainId
    if (!Object.hasOwnProperty.call(latestEntity, chainId)) {
      // fetch the meta entity from the store (we'll update this once we've committed all changes)
      latestEntity[chainId] = await Store.get<{
        id: string;
        latestBlock: number;
        locked: boolean;
        lockedAt: number;
        _block_num: number;
        _block_ts: number;
      }>("__meta__", `${chainId}`); // if this is null but we have rows in the collection, we could select the most recent and check the lastBlock
      // hydrate the locked bool
      locked[chainId] = latestEntity[chainId]?.locked;
      // check when the lock was instated
      blocked[chainId] =
        latestEntity[chainId]?.lockedAt ||
        latestEntity[chainId]?.latestBlock ||
        0;

      // toBlock is always "latest" from when we collected the events
      latestBlock[chainId] = await provider.getBlock("latest");

      // when the db is locked check if it should be released before ending all operations
      if (
        !newDb &&
        locked[chainId] &&
        // this offset should be chain dependent
        +blocked[chainId] + 10 > (latestBlock[chainId].number || 0) &&
        // if the lock hasnt been cleared by another prov
        !clearLock
      ) {
        // mark the operation in the log
        console.log("--\n\nSync error:", chainId, " - DB is locked", "\n");

        // record when we finished the sync operation
        const endTime = performance.now();

        // print time in console
        console.log(
          `\n===\n\nTotal execution time: ${(
            Number(endTime - startTime) / 1000
          ).toPrecision(4)}s\n\n`
        );

        // return error state to caller
        return {
          error: "DB is locked",
        };
      }

      // if the blocked frame has passed on this provider we can clear locks for other providers
      if (+blocked[chainId] + 10 <= (latestBlock[chainId].number || 0)) {
        clearLock = true;
      }

      // set the chainId into the engine
      Store.setChainId(chainId);
      // clear the current block state so we don't disrupt sync timestamps on the entity
      Store.clearBlock();

      // set the lock (this will be released on successful update)
      latestEntity[chainId].set("locked", true);
      // move the lockedAt to now to prevent adjacent runs unlocking at the same time
      latestEntity[chainId].set("lockedAt", latestBlock[chainId].number);

      // save the new locked state on the chainId (this will save immediately - we're not inside a checkpoint)
      await latestEntity[chainId].save();
    }

    // record the eventNames callback to execute on final sorted list
    callbacks[`${getAddress(address)}-${eventName}`] =
      callbacks[`${getAddress(address)}-${eventName}`] || onEvent;

    // record the event interface so we can reconstruct args to feed to callback
    eventIfaces[`${getAddress(address)}-${eventName}`] =
      eventIfaces[`${getAddress(address)}-${eventName}`] ||
      new ethers.utils.Interface(eventAbi);

    // check if we should be pulling events in this sync or using the tmp cache
    if (
      !start ||
      Stage[start] === Stage.events ||
      !fs.existsSync(
        `${cwd}events-latestRun-${address}-${eventName}-${chainId}.csv`
      )
    ) {
      // start the run from the blocks
      if (start && Stage[start] > Stage.events) {
        start = "blocks";
      }
      // set the block frame
      const toBlock = latestBlock[chainId].number;
      const fromBlock = latestEntity[chainId]._block_num || startBlock;
      const fromTime = latestEntity[chainId]._block_ts || startBlock;

      // mark engine as newDb
      if (!latestEntity[chainId].latestBlock) {
        newDb = engine.newDb = true;
      }

      // record the startBlock and time
      startBlocks[chainId] = fromBlock;
      startTimes[chainId] = fromTime;

      // mark the operation in the log
      console.log("--\n\nSync chainID:", chainId, { fromBlock, toBlock }, "\n");

      // all new events to be processed in this sync (only make the req if we will be querying a new block)
      newEvents =
        toBlock >= fromBlock
          ? await getNewEvents(
              address,
              eventAbi,
              eventName,
              fromBlock,
              toBlock,
              provider,
              opts?.collectTxReceipts || !skipTransactions
            )
          : [];

      // record the entities run so we can step back to this spot
      await saveCSV(
        `${cwd}events-latestRun-${address}-${eventName}-${chainId}.csv`,
        newEvents
      );
    } else if (
      !start ||
      Stage[start] < Stage.process ||
      (!fs.existsSync(`${cwd}events-latestRun-allData.csv`) &&
        fs.existsSync(
          `${cwd}events-latestRun-${address}-${eventName}-${chainId}.csv`
        ))
    ) {
      // assume that we're starting a fresh db
      newDb = engine.newDb = true;
      // start the run from the blocks
      if (start && Stage[start] >= Stage.process) {
        start = "blocks";
      }
      // read in events from disk
      newEvents = await readCSV(
        `${cwd}events-latestRun-${address}-${eventName}-${chainId}.csv`
      );
    }

    // only need to do this if we got new events
    if (newEvents) {
      // record the fully resolved discovery
      console.log(`\n${eventName} new events:`, newEvents.length, "\n");
      // push all new events to the event log
      events = events.concat(newEvents);
    }
  }

  // if we're starting the process here then print the discovery
  if (!start || (start && Stage[start] < Stage.process)) {
    // detail everything which was loaded in this run
    console.log("\n--\n\nTotal no. events discovered:", events.length, "\n");
  }

  // check if we're gathering blocks in this sync
  if (
    !skipBlocks &&
    (!start || Stage[start] <= Stage.sort) &&
    (!stop || Stage[stop] >= Stage.blocks)
  ) {
    // extract blocks and call getBlock once for each discovered block - then index against blocks number
    await getFnResultForProp<Block>(
      events,
      "blocks",
      "blockNumber",
      "getBlock",
      "timestamp"
    );
    console.log(
      "Total no. of timestamps placed:",
      events.length,
      events.length && `(first entry has ts: ${events[0].timestamp})\n`
    );
  }

  // check if we're globally including, or individually including the txReceipts
  const collectTxReceipts = syncs.reduce((collectTxReceipt, opSync) => {
    return collectTxReceipt || opSync.opts?.collectTxReceipts || false;
  }, !skipTransactions);

  // check if we're gathering transactions in this sync
  if (
    collectTxReceipts &&
    (!start || Stage[start] <= Stage.sort) &&
    (!stop || Stage[stop] >= Stage.transactions)
  ) {
    const filtered = events.filter((evt) => !!evt.collectTxReceipt);

    // extract transactions and call getTransactionReceipt once for each discovered tx
    await getFnResultForProp<TransactionReceipt>(
      filtered,
      "transactions",
      "transactionHash",
      "getTransactionReceipt",
      "from"
    );
    console.log(
      "Total no. of senders placed:",
      filtered.length,
      filtered.length && `(first entry has sender: ${filtered[0].from})\n`
    );
  }

  // check if we're performing a sort in this sync
  if (
    (!start || Stage[start] <= Stage.sort) &&
    (!stop || Stage[stop] >= Stage.sort)
  ) {
    // sort the events by block timestamp then tx order
    sorted = events.sort((a, b) => {
      // sort on blockNumber first
      const blockSort = !skipBlocks
        ? (a.timestamp || 0) - (b.timestamp || 0)
        : (a.data.blockNumber || 0) - (b.data.blockNumber || 0);

      // if blockNumbers match sort on txIndex
      return blockSort !== 0
        ? blockSort
        : a.data.transactionIndex - b.data.transactionIndex;
    });

    // save all events to disk
    await saveCSV(`${cwd}events-latestRun-allData.csv`, sorted);

    // sorted by timestamp
    console.log("--\n\nEvents sorted", sorted.length);
  }

  // check if we start on "process" in this sync and pull all the sorted content from the tmp store
  if (start && Stage[start] === Stage.process) {
    // log the start of the operation
    console.log(
      "\n\nStarting sync by restoring last-runs sorted events...\n\n--\n"
    );

    // assume that we're starting a fresh db
    newDb = engine.newDb = true;

    // restore the sorted collection
    sorted = await readCSV(`${cwd}events-latestRun-allData.csv`);

    // detail everything which was loaded in this run
    console.log("Total no. events discovered:", sorted.length);
  }

  // check if we're finalising the process in this sync
  if (
    (!start || Stage[start] <= Stage.process) &&
    (!stop || Stage[stop] >= Stage.process)
  ) {
    // store the updates until we've completed the call
    const chainUpdates: string[] = [];

    // create a checkpoint
    engine?.stage?.checkpoint();

    // log that we're starting
    process.stdout.write(`\n--\n\nEvents processed `);

    // iterate the sorted events and process the callbacks with the given args (sequentially)
    for (const opSorted of sorted) {
      // get an interface to parse the args
      const iface =
        eventIfaces[`${getAddress(opSorted.data.address)}-${opSorted.type}`];

      // make sure we've correctly discovered an iface
      if (iface) {
        // extract the args
        const { args } = iface.parseLog({
          topics: opSorted.data.topics,
          data: opSorted.data.data,
        });
        // transactions can be skipped if we don't need the details in our sync handlers
        const tx =
          (skipOptionalArgs || skipTransactions) && !opSorted.collectTxReceipt
            ? ({
                contractAddress: opSorted.data.address,
                transactionHash: opSorted.data.transactionHash,
                transactionIndex: opSorted.data.transactionIndex,
                blockHash: opSorted.data.blockHash,
                blockNumber: opSorted.data.blockNumber,
              } as unknown as TransactionReceipt)
            : await readJSON<TransactionReceipt>(
                "transactions",
                `${opSorted.chainId}-${opSorted.data.transactionHash}`
              );
        // get the tx and block from tmp storage
        const block =
          skipOptionalArgs || skipBlocks
            ? ({
                hash: opSorted.data.blockHash,
                number: opSorted.data.blockNumber,
                timestamp: opSorted.timestamp || opSorted.data.blockNumber,
              } as unknown as Block)
            : await readJSON<Block>(
                "blocks",
                `${opSorted.chainId}-${opSorted.data.blockNumber}`
              );
        // set the chainId into the engine
        Store.setChainId(opSorted.chainId);
        // set the block for each operation into the runtime engine before we run the handler
        Store.setBlock(
          block && block.timestamp
            ? block
            : ({
                timestamp: opSorted.timestamp || opSorted.data.blockNumber,
                number: opSorted.data.blockNumber,
              } as Block)
        );
        // await the response of the handler before moving to the next operation in the sorted ops
        await callbacks[
          `${getAddress(opSorted.data.address)}-${opSorted.type}`
        ](
          // pass the parsed args construct
          args,
          // read tx and block from file (this avoids filling the memory with blocks/txs as we collect them - in prod we store into /tmp/)
          {
            tx,
            block,
            logIndex: opSorted.data.logIndex,
          }
        );
      }
    }

    // mark after we end
    process.stdout.write("✔\nEntities stored ");

    // commit the checkpoint on the db...
    await engine?.stage?.commit();

    // no longer a newDB after committing changes
    newDb = engine.newDb = false;

    // after commit all events are stored in db
    process.stdout.write("✔\nPointers updated ");

    // commit an update for each provider used in the sync (these are normal db.put's to always write to the same entries)
    await Promise.all(
      Array.from(chainIds).map(async (chainId) => {
        // we want to select the latest block this chains events
        const chainsEvents: typeof events = sorted.filter(
          (ev) => ev.chainId === chainId
        );
        // get the last entry in this array
        const chainsLatestBlock: (typeof events)[0] =
          chainsEvents[chainsEvents.length - 1];

        // extract latest update
        const latestTimestamp =
          chainsLatestBlock?.timestamp || chainsLatestBlock?.data.blockNumber;
        const latestBlockNumber = chainsLatestBlock?.data.blockNumber;

        // log the pointer update we're making with this sync
        chainUpdates.push(
          `Chain pointer update: id::${chainId} → ${JSON.stringify({
            fromBlock: startBlocks[chainId],
            // if we didn't find any events then we can keep the toBlock as startBlock
            toBlock: latestBlockNumber || startBlocks[chainId],
            // this will be the starting point for the next block
            nextBlock: (latestBlockNumber || startBlocks[chainId] || 0) + 1,
          })}`
        );

        // only save the update if we have a blockNumber to save against (otherwise the next tick can start from the same block again)
        if (latestBlockNumber) {
          // set the chainId into the engine
          Store.setChainId(chainId);
          // make sure we're storing against the correct block
          Store.setBlock({
            // we add 1 here so that the next sync starts beyond the last block we processed (handlers are not idempotent - we must make sure we only process each event once)
            number: latestBlockNumber + 1,
            timestamp: latestTimestamp,
          } as unknown as Block);
          // save the latest entry
          latestEntity[chainId].set("latestBlock", latestBlockNumber);
        } else {
          // clear the block to leave pointers untouched
          Store.clearBlock();
        }

        // remove the lock for the next iteration
        latestEntity[chainId].set("locked", false);

        // persist changes into the store
        await latestEntity[chainId].save();
      })
    );

    // finished after updating pointers
    process.stdout.write("✔\n");

    // place some space before the updates
    console.log("\n--\n");

    // log each of the chainUpdate messages
    chainUpdates.forEach((msg) => {
      console.log(msg);
    });
  } else {
    // otherwise release locks because we'e not altering db state
    await Promise.all(
      Array.from(chainIds).map(async (chainId) => {
        // clear the block to leave pointers untouched
        Store.clearBlock();
        // set the chainId into the engine
        Store.setChainId(chainId);
        // remove the lock for the next iteration
        latestEntity[chainId].set("locked", false);

        // persist changes into the store
        await latestEntity[chainId].save();
      })
    );
  }

  // record when we finished the sync operation
  const endTime = performance.now();

  // print time in console
  console.log(
    `\n===\n\nTotal execution time: ${(
      Number(endTime - startTime) / 1000
    ).toPrecision(4)}s\n\n`
  );

  // return a summary of the operation to the caller
  return {
    syncOps: syncs.length,
    events: sorted.length,
    runTime: Number((endTime - startTime) / 1000).toPrecision(4),
    chainIds: Array.from(chainIds),
    eventsByChain: Array.from(chainIds).reduce(
      (all, chainId) => ({
        ...all,
        [chainId]: sorted.filter((vals) => vals.chainId === chainId).length,
      }),
      {} as Record<number, number>
    ),
    startBlocksByChain: Object.keys(startBlocks).reduce(
      (all, chainId) => ({
        ...all,
        [chainId]: startBlocks[chainId],
      }),
      {} as Record<number, number>
    ),
    latestBlocksByChain: Object.keys(latestEntity).reduce(
      (all, chainId) => ({
        ...all,
        [chainId]: latestEntity[chainId].latestBlock,
      }),
      {} as Record<number, number>
    ),
  };
};
