import { getAddress } from "ethers/lib/utils";
import { NextResponse, NextRequest } from "next/server";

// force-dynamic rendering as we're basing reqs on url
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!process.env.PRODUCTION_FAUCET_KEY) {
    return NextResponse.json({ error: "Missing controller auth key" });
  }

  if (!process.env.PRODUCTION_FAUCET_URL) {
    return NextResponse.json({ error: "Missing controller url" });
  }

  try {
    const { searchParams } = new URL(request.nextUrl);
    const address = searchParams.get("address");

    const res = await fetch(
      `${process.env.PRODUCTION_FAUCET_URL.replace(
        /\/$/,
        ""
      )}/claim/find/wallet/${getAddress(address?.toLowerCase() || "")}`,
      {
        method: "GET",
        headers: new Headers({
          "auth-key": process.env.PRODUCTION_FAUCET_KEY,
        }),
        redirect: "follow" as RequestRedirect,
        // don't store responses
        cache: "no-store",
      }
    );
    const claimedRes = await res.json();

    // return the response with headers
    return new NextResponse(JSON.stringify(claimedRes), {
      status: 200,
      headers: new Headers({
        "Cache-control": "no-store",
      }),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}
