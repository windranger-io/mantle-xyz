import { headers } from "next/headers";
import { Session } from "next-auth";

import { WagmiProvider } from "@providers/wagmiContext";
import { StateProvider } from "@providers/stateContext";
import WalletProvider from "@providers/walletProvider";
import { ToastContainer } from "@components/Toast";

import { getSession } from "./session";
import AuthContext from "./context";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // recreate session provider so that we can access the session on client side
  // without converting the root layout to "use client"
  const session = await getSession(headers().get("cookie") ?? "");

  return (
    <WagmiProvider>
      <StateProvider>
        <WalletProvider />
        <AuthContext session={session || ({} as unknown as Session)}>
          <ToastContainer>{children}</ToastContainer>
        </AuthContext>
      </StateProvider>
    </WagmiProvider>
  );
}
