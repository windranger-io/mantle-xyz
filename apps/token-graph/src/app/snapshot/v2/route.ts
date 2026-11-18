import { NextRequest, NextResponse } from "next/server";

const fetchL2SnapshotVotes = async (address: string, snapshot: string) => {
  const fetchSnapshotVotes = await fetch(
    `${process.env.NEXT_PUBLIC_DELEGATEVOTE_SUBGRAPH_API}`,
    {
      cache: "no-store",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query GetDelegates($address: String!, $snapshot: Float!){
            l2TotalVotesChangedsByAddressAndBlockNumber(address: $address, blockNumber: $snapshot, limit: 1) {
              address
              totalVotes
            }
          }
        `,
        variables: {
          address: address.toLowerCase(),
          // "latest" -> Number() is NaN (sent as null); use the resolver's default = latest
          snapshot: Number(snapshot) || Number.MAX_SAFE_INTEGER,
        },
      }),
    }
  );

  const { data, errors } = await fetchSnapshotVotes.json();
  if (!data?.l2TotalVotesChangedsByAddressAndBlockNumber) {
    throw new Error(`subgraph error: ${JSON.stringify(errors)}`);
  }
  let totalVotes = "0";

  if (
    data.l2TotalVotesChangedsByAddressAndBlockNumber.length &&
    data.l2TotalVotesChangedsByAddressAndBlockNumber[0].totalVotes
  ) {
    totalVotes = data.l2TotalVotesChangedsByAddressAndBlockNumber[0].totalVotes;
  }

  return totalVotes;
};

export async function GET() {
  return NextResponse.json({
    result: "ok",
  });
}

export async function POST(request: NextRequest) {
  const { addresses, snapshot } = (await request.json()) as {
    addresses: string[];
    snapshot: string;
  };

  const score: { address: string; score: string }[] = [];

  /* eslint-disable */
  for (const addr of addresses) {
    console.log(addr);
    const l2Votes: string = await fetchL2SnapshotVotes(addr, snapshot);
    score.push({
      address: addr,
      score: l2Votes,
    });
  }
  /* eslint-enable */

  return NextResponse.json(
    {
      score,
    },
    {
      headers: {
        // allow to be cached for revalidate seconds and allow caching in shared public cache (upto revalidate seconds)
        "Cache-Control": `max-age=99999999, public, s-maxage=99999999`,
      },
    }
  );
}
