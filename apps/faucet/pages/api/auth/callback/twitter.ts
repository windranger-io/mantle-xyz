import type { NextApiRequest, NextApiResponse } from "next";
import { OAuth2 } from "@xdevplatform/xdk";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  OAUTH_ADDRESS_COOKIE,
  SESSION_COOKIE,
  parseCookies,
  signSession,
} from "../../../../src/lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state, error: oauthError } = req.query;

  if (oauthError) {
    res.redirect(`/?auth_error=${encodeURIComponent(String(oauthError))}`);
    return;
  }
  if (!code || !state) {
    res.redirect("/?auth_error=missing_code_or_state");
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  const savedState = cookies[OAUTH_STATE_COOKIE];
  const codeVerifier = cookies[OAUTH_VERIFIER_COOKIE];
  const boundAddress = cookies[OAUTH_ADDRESS_COOKIE];

  if (!savedState || savedState !== state) {
    res.redirect("/?auth_error=state_mismatch");
    return;
  }
  if (!codeVerifier) {
    res.redirect("/?auth_error=missing_verifier");
    return;
  }
  if (!boundAddress) {
    res.redirect("/?auth_error=missing_address");
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || `http://${req.headers.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/twitter`;

  try {
    const oauth2 = new OAuth2({
      clientId: process.env.TWITTER_ID!,
      clientSecret: process.env.TWITTER_SECRET!,
      redirectUri,
      scope: ["tweet.read", "users.read", "offline.access"],
    });

    const tokens = await oauth2.exchangeCode(code as string, codeVerifier);

    const meRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const meJson = await meRes.json();
    const username = meJson?.data?.username;

    if (!username) {
      res.redirect("/?auth_error=failed_to_fetch_user");
      return;
    }

    const sessionCookie = signSession({
      username,
      walletAddress: boundAddress,
    });

    res.setHeader("Set-Cookie", [
      `${SESSION_COOKIE}=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      `${OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; Max-Age=0`,
      `${OAUTH_VERIFIER_COOKIE}=; Path=/; HttpOnly; Max-Age=0`,
      `${OAUTH_ADDRESS_COOKIE}=; Path=/; HttpOnly; Max-Age=0`,
    ]);

    res.redirect("/");
  } catch (err: any) {
    res.redirect(
      `/?auth_error=${encodeURIComponent(
        err?.message || "token_exchange_failed"
      ).slice(0, 200)}`
    );
  }
}
