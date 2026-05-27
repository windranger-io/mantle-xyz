import { RainbowKit } from "@providers/rainbowContext";
import { StateProvider } from "@providers/stateContext";
import { ToastContainer } from "@components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RainbowKit>
      <StateProvider>
        <ToastContainer>{children}</ToastContainer>
      </StateProvider>
    </RainbowKit>
  );
}
