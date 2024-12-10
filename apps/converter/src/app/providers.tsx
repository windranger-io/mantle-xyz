import { RainbowKit as RainbowKitProvider } from "@providers/rainbowContext";
import { ApolloWrapper } from "@providers/apolloProvider";
import { StateProvider } from "@providers/stateContext";
import { ToastContainer } from "@components/Toast";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RainbowKitProvider>
      <ApolloWrapper>
        <StateProvider>
          <ToastContainer>{children}</ToastContainer>
        </StateProvider>
      </ApolloWrapper>
    </RainbowKitProvider>
  );
}
