import { WagmiProvider } from "@providers/wagmiContext";
import { ApolloWrapper } from "@providers/apolloProvider";
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
        <StateProvider>
          <WalletProvider />
          <ToastContainer>{children}</ToastContainer>
        </StateProvider>
      </ApolloWrapper>
    </WagmiProvider>
  );
}
