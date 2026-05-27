import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

interface UseAccountConnectionEffectProps {
  onConnectToDisconnect?: () => void;
  onDisconnectToConnect?: (data: {
    address?: `0x${string}`;
    chainId?: number;
  }) => void;
  onConnect?: (data: { address?: `0x${string}`; chainId?: number }) => void;
  onDisconnect?: () => void;
  onSwitchAccount?: (data: { address?: `0x${string}` }) => void;
}

function useAccountConnectionEffect({
  onConnectToDisconnect,
  onDisconnectToConnect,
  onConnect,
  onDisconnect,
  onSwitchAccount,
}: UseAccountConnectionEffectProps): void {
  const { address, isConnected, chainId } = useAccount();
  const prevIsConnectedRef = useRef<boolean | null>(null);
  const prevAddress = useRef<string | null | undefined>(null);

  useEffect(() => {
    const wasConnected = prevIsConnectedRef.current;
    const isNowConnected = isConnected;
    const currentAddress = address;

    // disconnected → connected
    if (wasConnected === false && isNowConnected === true && currentAddress) {
      onDisconnectToConnect?.({ address: currentAddress, chainId });
    }

    // connected → disconnected
    if (wasConnected === true && isNowConnected === false) {
      onConnectToDisconnect?.();
    }

    // currently connected
    if (isNowConnected && currentAddress) {
      onConnect?.({ address: currentAddress, chainId });
    }

    // currently disconnected (skip very first render)
    if (wasConnected !== null && !isNowConnected) {
      onDisconnect?.();
    }

    // account switch
    if (
      prevAddress.current &&
      currentAddress &&
      prevAddress.current !== currentAddress
    ) {
      onSwitchAccount?.({ address: currentAddress });
    }

    prevIsConnectedRef.current = isNowConnected;
    prevAddress.current = currentAddress;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);
}

export default useAccountConnectionEffect;
