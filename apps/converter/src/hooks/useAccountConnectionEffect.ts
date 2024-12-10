import { useEffect, useRef } from "react";
import { Connector, useAccount } from "wagmi";

interface UseAccountConnectionEffectProps {
  onConnectToDisconnect?: () => void;
  onDisconnectToConnect?: (data: {
    address?: `0x${string}`;
    connector?: Connector;
    chainId?: number;
  }) => void;
  onConnect?: (data: {
    address?: `0x${string}`;
    connector?: Connector;
    chainId?: number;
  }) => void;
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
  const { address, isConnected, chainId, connector } = useAccount();
  const prevIsConnectedRef = useRef<boolean | null>(null);
  const prevAddress = useRef<string | null | undefined>(null);

  useEffect(() => {
    const wasConnected = prevIsConnectedRef.current;
    const isNowConnected = isConnected;
    const currentAddress: (`0x${string}` & {}) | `0x${string}` | undefined =
      address;

    // 从未连接到已连接
    if (wasConnected === false && isNowConnected === true && currentAddress) {
      onDisconnectToConnect?.({ address: currentAddress, chainId, connector });
    }

    // 从已连接到未连接
    if (wasConnected === true && isNowConnected === false) {
      onConnectToDisconnect?.();
    }

    // 检测到连接
    if (isNowConnected && currentAddress) {
      onConnect?.({ address: currentAddress, connector, chainId });
    }

    // 检测到断开连接
    if (wasConnected !== null && !isNowConnected) {
      onDisconnect?.();
    }

    // 切换了连接账户
    if (
      prevAddress.current &&
      currentAddress &&
      prevAddress.current !== currentAddress
    ) {
      onSwitchAccount?.({ address: currentAddress });
    }

    // 更新之前的连接状态
    prevIsConnectedRef.current = isNowConnected;

    // 保留上一次的连接地址
    prevAddress.current = currentAddress;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);
}

export default useAccountConnectionEffect;
