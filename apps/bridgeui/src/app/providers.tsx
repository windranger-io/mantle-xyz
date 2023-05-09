import { StateProvider } from "@context/state";
import { WagmiProvider } from "@providers/wagmi-context";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider>
      <StateProvider>{children}</StateProvider>
    </WagmiProvider>
  );
}
