import type { NextApiRequest, NextApiResponse } from "next";
import {
  SESSION_COOKIE,
  parseCookies,
  verifySession,
} from "../../../src/lib/session";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parseCookies(req.headers.cookie);
  const session = verifySession(cookies[SESSION_COOKIE]);

  res.setHeader("Cache-Control", "no-store");
  if (!session) {
    res.json({ user: null });
    return;
  }
  res.json({
    user: {
      username: session.username,
      walletAddress: session.walletAddress,
    },
  });
}
