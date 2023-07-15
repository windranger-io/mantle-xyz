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

    const myHeaders = new Headers();
    myHeaders.append("auth-key", process.env.PRODUCTION_FAUCET_KEY);

    const res = await fetch(
      `${process.env.PRODUCTION_FAUCET_URL}/claim/find/wallet/${address}`,
      {
        headers: myHeaders,
      }
    );
    const claimedRes = await res.json();
    return NextResponse.json(claimedRes);
  } catch (e) {
    console.error(e);
  }
}
