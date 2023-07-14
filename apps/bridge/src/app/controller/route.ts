import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!process.env.CONTROLLER_AUTH_KEY) {
    return NextResponse.json({ error: "Missing controller auth key" });
  }

  if (!process.env.CONTROLLER_URL) {
    return NextResponse.json({ error: "Missing controller url" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    const myHeaders = new Headers();
    myHeaders.append("auth-key", process.env.CONTROLLER_AUTH_KEY);

    const res = await fetch(
      `${process.env.CONTROLLER_URL}/claim/find/wallet/${address}`,
      {
        headers: myHeaders,
      }
    );
    const claimedRes = await res.text();
    return NextResponse.json(claimedRes);
  } catch (e) {
    console.error(e);
  }
}
