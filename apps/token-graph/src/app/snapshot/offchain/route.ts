import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

async function loadDelegationData(snapshot?: string): Promise<any> {
  try {
    if (!snapshot) {
      const { blobs } = await list({
        token: BLOB_TOKEN,
        prefix: "merged-latest",
      });
      const mergedBlob = blobs.find((b) => b.pathname === "merged-latest.json");

      if (!mergedBlob) {
        // eslint-disable-next-line no-console
        console.warn("⚠️ No merged-latest.json found in Blob Store");
        return {};
      }

      const res = await fetch(mergedBlob.url);
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to fetch merged-latest.json:", res.statusText);
        return {};
      }

      return await res.json();
    }

    const targetBlock = parseInt(snapshot, 10);

    const { blobs } = await list({
      token: BLOB_TOKEN,
      prefix: "merged-block-",
    });

    const bestSnapshot = blobs
      .filter((b) => /^merged-block-\d+\.json$/.test(b.pathname))
      .map((b) => ({
        blob: b,
        blockNumber: parseInt(
          b.pathname.match(/merged-block-(\d+)\.json$/)?.[1] || "0",
          10
        ),
      }))
      .filter((item) => item.blockNumber <= targetBlock && item.blockNumber > 0) // only <= target block snapshot
      .sort((a, b) => b.blockNumber - a.blockNumber)[0]; // descending order, the closest one is in front

    if (bestSnapshot) {
      // eslint-disable-next-line no-console
      console.log(
        `🔒 Using block snapshot: ${bestSnapshot.blockNumber} for target: ${targetBlock}`
      );

      const res = await fetch(bestSnapshot.blob.url);
      if (res.ok) {
        return await res.json();
      }
    }

    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ No suitable block snapshot found for block ${targetBlock}, falling back to latest`
    );

    return await loadDelegationData();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error loading delegation data:", error);
    return {};
  }
}

// extract vote weights (accumulate)
function extractVoteWeights(
  mergedData: Record<string, any[]>,
  addresses: string[]
): Record<string, number> {
  const result: Record<string, number> = {};
  addresses.forEach((addr) => {
    result[addr] = 0;
  });

  const delegationData = mergedData.data;

  if (!delegationData || typeof delegationData !== "object") {
    // eslint-disable-next-line no-console
    console.warn("⚠️ Invalid delegation data structure");
    return result;
  }

  Object.values(delegationData).forEach((orgEntries) => {
    if (!Array.isArray(orgEntries)) return;
    orgEntries.forEach((entry) => {
      if (entry.Address && entry.Voteweight) {
        const address = entry.Address.toLowerCase();
        const weight = parseInt(entry.Voteweight.toString(), 10) || 0;
        addresses.forEach((reqAddr) => {
          if (reqAddr.toLowerCase() === address) {
            result[reqAddr] += weight;
          }
        });
      }
    });
  });

  return result;
}

// POST endpoint
export async function POST(request: NextRequest) {
  try {
    const { addresses, snapshot } = (await request.json()) as {
      addresses: string[];
      snapshot?: string;
    };

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: "Invalid addresses parameter" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line no-console
    console.log("addresses", addresses);
    // eslint-disable-next-line no-console
    console.log("snapshot block", snapshot);

    const snapshotParam = snapshot === "latest" ? undefined : snapshot;

    const mergedData = await loadDelegationData(snapshotParam);
    const voteWeights = extractVoteWeights(mergedData, addresses);

    // Convert to v2 format: array of { address, score }
    const score = addresses.map((address) => ({
      address,
      score: voteWeights[address].toString(),
    }));

    return NextResponse.json(
      {
        score,
      },
      {
        headers: {
          // Match v2 cache settings
          "Cache-Control": "max-age=99999999, public, s-maxage=99999999",
        },
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error processing delegation request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
