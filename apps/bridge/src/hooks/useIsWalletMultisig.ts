import { BaseProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export function useIsWalletMultisig(
  provider: BaseProvider,
  walletAddress?: string
): boolean {
  const [isMultisig, setIsMultisig] = useState<boolean>(false);

  useEffect(() => {
    async function checkMultisig(wallet: string): Promise<void> {
      const byteCode = await provider.getCode(wallet);

      if (!byteCode || ethers.utils.hexStripZeros(byteCode) === "0x") {
        setIsMultisig(false);
      } else {
        setIsMultisig(true);
      }
    }

    if (walletAddress) {
      checkMultisig(walletAddress);
    }
  }, [walletAddress, provider]);

  return isMultisig;
}
