import { WagmiProvider } from "@providers/wagmiContext";
import { StateProvider } from "@providers/stateContext";
import WalletProvider from "@providers/walletProvider";

// TODO: remove unused providers
export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider>
      <StateProvider>
        <WalletProvider />
        {children}
      </StateProvider>
    </WagmiProvider>
  );
}
