// Use addSync to add operations and sync to process them all in block/tx order
import { NextRequest, NextResponse } from "next/server";

// Connect to mantle rpc to get L2 balances
import { JsonRpcProvider } from "@ethersproject/providers";

// prepare a query to request L2 block from L1 block number
const query = `
  query L2BlockFromL1Block($L1Block: String!) {
    stateBatchAppends(
      first: 1
      skip: 0
      orderBy: batchIndex
      orderDirection: desc
      where: { txBlock_lte: $L1Block }
    ) {
      prevTotalElements
    }
  }
`;

// Expose a post handler to accept api-v2 type strategy reqs from snapshot
export async function POST(request: NextRequest) {
  // return only the requested addresses at the given snapshot block
  const { addresses, snapshot } = (await request.json()) as {
    addresses: string[];
    snapshot: string;
  };

  // fetch from graphql
  const data = await fetch(
    process.env.MANTLE_BRIDGE_SCC || "http://localhost:3003/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        query,
        variables: {
          L1Block: `${snapshot}`,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        // allow to be cached for revalidate seconds and allow caching in shared public cache (upto revalidate seconds)
        "Cache-Control": `max-age=99999999, public, s-maxage=99999999`,
      },
    }
  ).then(async (res) => (await res.json()).data);

  // get L2 block from supagraph (default to first block so that we dont go to 0 and get latest)
  const L2Block = data.stateBatchAppends[0]?.prevTotalElements || 1;

  // use unrestricted provider
  const provider = new JsonRpcProvider(process.env.MANTLE_RPC_URI || "");

  // default to no scores (fill from cache or create snapshot and store)
  const finalVotes: { address: string; score: string }[] = await Promise.all(
    addresses.map(async (address) => {
      return {
        address,
        score: (
          await provider.getBalance(address, parseInt(`${L2Block}`, 10))
        ).toString(),
      };
    })
  );

  // return the requested scores for the requested users
  return NextResponse.json(
    {
      score: finalVotes,
    },
    {
      headers: {
        // allow to be cached for revalidate seconds and allow caching in shared public cache (upto revalidate seconds)
        "Cache-Control": `max-age=99999999, public, s-maxage=99999999`,
      },
    }
  );
}
