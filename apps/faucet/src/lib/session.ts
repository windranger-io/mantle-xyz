import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "dev-only-fallback-secret";

export type SessionData = {
  username: string;
  walletAddress: string; // lowercase address this session is bound to
};

function hmac(payload: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
}

/** Sign a session payload into a cookie-safe string: base64url(json).signature */
export function signSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

/** Verify & parse a session cookie. Returns null on tamper or missing. */
export function verifySession(cookie: string | undefined): SessionData | null {
  if (!cookie) return null;
  const [payload, sig] = cookie.split(".");
  if (!payload || !sig) return null;
  if (hmac(payload) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** Parse cookies header into a key-value object */
export function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
}

export const SESSION_COOKIE = "faucet_session";
export const OAUTH_STATE_COOKIE = "faucet_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "faucet_oauth_verifier";
export const OAUTH_ADDRESS_COOKIE = "faucet_oauth_address";
