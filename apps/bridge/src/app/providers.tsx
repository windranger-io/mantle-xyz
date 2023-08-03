import { WagmiProvider } from "@providers/wagmiContext";
import { ApolloWrapper } from "@providers/apolloProvider";
import { MantleSDKProvider } from "@providers/mantleSDKContext";
import { StateProvider } from "@providers/stateContext";
import WalletProvider from "@providers/walletProvider";
import { ToastContainer } from "@components/Toast";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider>
      <ApolloWrapper>
        <MantleSDKProvider>
          <StateProvider>
            <WalletProvider />
            <ToastContainer>{children}</ToastContainer>
          </StateProvider>
        </MantleSDKProvider>
      </ApolloWrapper>
    </WagmiProvider>
  );
}
