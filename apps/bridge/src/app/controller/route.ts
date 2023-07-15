import { getAddress } from "ethers/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!process.env.PRODUCTION_FAUCET_KEY) {
    return NextResponse.json({ error: "Missing controller auth key" });
  }

  if (!process.env.PRODUCTION_FAUCET_URL) {
    return NextResponse.json({ error: "Missing controller url" });
  }

  try {
    const { searchParams } = new URL(request.url);
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
        next: {
          revalidate: 30,
        },
      }
    );
    const claimedRes = await res.json();
    return NextResponse.json(claimedRes);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}
