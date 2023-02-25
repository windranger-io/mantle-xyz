import { Session } from "next-auth";

export async function getSession(cookie: string): Promise<Session> {
  const response = await fetch(
    `${process.env.NEXTAUTH_URL?.replace(/\/$/, "")}/api/auth/session`,
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  const session = await response.json();

  return Object.keys(session).length > 0 ? session : {};
}
