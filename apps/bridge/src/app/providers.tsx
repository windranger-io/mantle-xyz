import { WagmiProvider } from "@providers/wagmiContext";
import { MantleSDKProvider } from "@providers/mantleSDKContext";
import { StateProvider } from "@providers/stateContext";

import { ToastContainer } from "@components/Toast";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider>
      <MantleSDKProvider>
        <StateProvider>
          <ToastContainer>{children}</ToastContainer>
        </StateProvider>
      </MantleSDKProvider>
    </WagmiProvider>
  );
}
