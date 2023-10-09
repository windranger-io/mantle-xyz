import { Session } from "next-auth";

const serverUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

export async function getSession(cookie: string): Promise<Session> {
  const response = await fetch(
    `${serverUrl?.replace(/\/$/, "")}/api/auth/session`,
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  const session = await response.json();

  return Object.keys(session).length > 0 ? session : {};
}
