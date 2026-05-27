import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import {
  OAuth2,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@xdevplatform/xdk";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  OAUTH_ADDRESS_COOKIE,
} from "../../../../src/lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const baseUrl = process.env.NEXTAUTH_URL || `http://${req.headers.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/twitter`;

  const walletAddress = String(req.query.address || "").toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(walletAddress)) {
    res.status(400).json({ error: "missing_or_invalid_address" });
    return;
  }

  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const oauth2 = new OAuth2({
    clientId: process.env.TWITTER_ID!,
    clientSecret: process.env.TWITTER_SECRET!,
    redirectUri,
    scope: ["tweet.read", "users.read", "offline.access"],
  });

  await oauth2.setPkceParameters(codeVerifier, codeChallenge);
  const authUrl = await oauth2.getAuthorizationUrl(state);

  const cookieOpts = "Path=/; HttpOnly; SameSite=Lax; Max-Age=600";
  res.setHeader("Set-Cookie", [
    `${OAUTH_STATE_COOKIE}=${state}; ${cookieOpts}`,
    `${OAUTH_VERIFIER_COOKIE}=${codeVerifier}; ${cookieOpts}`,
    `${OAUTH_ADDRESS_COOKIE}=${walletAddress}; ${cookieOpts}`,
  ]);
  res.redirect(authUrl);
}
