import { NextResponse } from "next/server";
import { CONTROLLER_URL } from "@config/constants";

export async function GET(request: Request) {
  if (!process.env.CONTROLLER_AUTH_KEY) {
    return NextResponse.json({ error: "Missing auth key" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    const myHeaders = new Headers();
    myHeaders.append("auth-key", process.env.CONTROLLER_AUTH_KEY);

    const res = await fetch(`${CONTROLLER_URL}/claim/find/wallet/${address}`, {
      headers: myHeaders,
    });
    const claimedRes = await res.json();
    return NextResponse.json(claimedRes);
  } catch (e) {
    console.error(e);
  }
}
