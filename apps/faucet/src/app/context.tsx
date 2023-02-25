"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export interface AuthContextProps {
  children: React.ReactNode;
  session: Session;
}

export default function AuthContext({ children, session }: AuthContextProps) {
  // we could filter the session content here to avoid sending any session secrets down the wire
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
