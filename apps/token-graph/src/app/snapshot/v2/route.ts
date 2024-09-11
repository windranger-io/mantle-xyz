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
        query: `
            query GetDelegates($snapshot: Float!, $address: String!) {
              addressL2VotesAtBlock(block: $snapshot, id: $address) {
                id
                totalL2Votes
                lastUpdateBlock
                l2Votes
                totalRewardsStationV1Amount
                totalRewardsStationV2Amount
              }
            }

        `,
        variables: {
          address: address.toLowerCase(),
          snapshot: Number(snapshot),
        },
      }),
    }
  );

  const snapshotVotes = await fetchSnapshotVotes.json();
  const { data } = await snapshotVotes;
  let l2Votes = "0";

  if (data.addressL2VotesAtBlock) {
    l2Votes = data.addressL2VotesAtBlock.totalL2Votes;
  }

  return l2Votes;
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
