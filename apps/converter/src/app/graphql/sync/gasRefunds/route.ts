// Process a batch of refunds into the db
import { NextResponse } from "next/server";

// Import revalidation timings from config
import config from "@supagraph/config";
import csvParser from "csv-parser";

// Read a csv stream
import { createReadStream } from "fs";

// Connect to mongo directly
import { getMongodb } from "@providers/mongoClient";
import { AnyBulkWriteOperation, Document } from "mongodb";

// Generate client
const client = getMongodb(process.env.MONGODB_URI!);

// forces the route handler to be dynamic
export const dynamic = "force-dynamic";

// move this when a new batch becomes available
const CURRENT_BATCH = 1;

// read the current batch csv
const readRefundsCSV = async (
  filePath: string
): Promise<
  {
    account: string;
    totalGasCost: string;
    appearanceCount: number;
    migrationTransactionHashes: string[];
    AirdropTransaction: string;
    AirdropTransasctionStatus: string;
  }[]
> => {
  const results: {
    account: string;
    totalGasCost: string;
    appearanceCount: number;
    migrationTransactionHashes: string[];
    AirdropTransaction: string;
    AirdropTransasctionStatus: string;
  }[] = [];

  return new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => {
        if (data[0] !== "account") {
          results.push({
            account: data.account,
            // fullwide to get rid of scientific notation
            totalGasCost: (+data.totalGasCost).toLocaleString("fullwide", {
              useGrouping: false,
            }),
            appearanceCount: +data.appearanceCount,
            // replace single quotes with double to make valid json
            migrationTransactionHashes: JSON.parse(
              data.migrationTransactionHashes.replace(/'/g, '"')
            ),
            // we only want the tx hash
            AirdropTransaction: data["Airdrop Transaction"].replace(
              "https://etherscan.io/tx/",
              ""
            ),
            AirdropTransasctionStatus: data["Airdrop Transasction Status"],
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

// Process the refunds saving the changes to db as we go...
const processRefunds = async (
  refunds: {
    account: string;
    totalGasCost: string;
    appearanceCount: number;
    migrationTransactionHashes: string[];
    AirdropTransaction: string;
    AirdropTransasctionStatus: string;
  }[]
) => {
  // fetch the db connection
  const mongo = (await client).db(config.name || "supagraph");

  // connect to the entity collection
  const collection = mongo.collection("migration");

  // place all updates into an array ready for bulkWrite
  const updates: AnyBulkWriteOperation<Document>[] = [];

  // run through all transactions refunded for the account
  while (refunds.length) {
    // collect 100 entries at once (parallelise the fill)
    const concurrent = refunds.splice(0, 100);

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      concurrent.map(async (refund) => {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(
          refund.migrationTransactionHashes.map(async (hash) => {
            // find the item as it is now
            const item = await collection.findOne({ transactionHash: hash });
            // if discovered update with refunded and refundTx props
            if (item) {
              // update the entry
              updates.push({
                updateOne: {
                  // find by _id
                  filter: {
                    // eslint-disable-next-line no-underscore-dangle
                    _id: item._id,
                  },
                  update: {
                    $set: {
                      ...item,
                      refunded: true,
                      refundTx: refund.AirdropTransaction,
                    },
                  },
                },
              });
            }
          })
        );
      })
    );
  }

  // make all writes at once
  await collection.bulkWrite(updates, {
    // allow for parallel writes
    ordered: false,
  });

  // return all updates we stacked for write
  return updates;
};

// Expose this via get so that we can call it when we need to...
export async function GET() {
  // collect the refunds that need to be processed
  const refunds = await readRefundsCSV(
    `${process.cwd()}/src/supagraph/refunds/batch${CURRENT_BATCH}.csv`
  );

  // process all refunds (updates will be unique migration event bulkWrite entries)
  const updates = await processRefunds(refunds);

  // return how many refunds have been processed
  return NextResponse.json(
    {
      refundsSaved: updates.length,
    },
    {
      headers: {
        // allow to be cached for revalidate seconds and allow caching in shared public cache (upto revalidate seconds)
        "Cache-Control": `max-age=${config.revalidate}, public, s-maxage=${config.revalidate}`,
      },
    }
  );
}
