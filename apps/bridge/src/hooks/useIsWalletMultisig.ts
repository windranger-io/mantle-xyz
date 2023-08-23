import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { providers, ethers } from "ethers";

export function useIsWalletMultisig(
  chainId?: number,
  walletAddress?: string
): boolean {
  const [isMultisig, setIsMultisig] = useState<boolean>(false);
  // get the provider for the chosen chain
  const publicClient = usePublicClient({ chainId });

  // create an ethers provider from the publicClient
  const provider = useMemo(() => {
    const { chain, transport } = publicClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback")
      return new providers.FallbackProvider(
        (transport.transports as { value: { url: string } }[]).map(
          ({ value }) => new providers.JsonRpcProvider(value?.url, network)
        )
      );
    return new providers.JsonRpcProvider(transport.url, network);
  }, [publicClient]);

  useEffect(() => {
    async function checkMultisig(wallet: string): Promise<void> {
      const byteCode = await provider.getCode(wallet);

      if (!byteCode || ethers.utils.hexStripZeros(byteCode) === "0x") {
        setIsMultisig(false);
      } else {
        setIsMultisig(true);
      }

      console.log({ byteCode, walletAddress, chainId });
    }

    if (walletAddress && chainId) {
      checkMultisig(walletAddress);
    }
  }, [chainId, walletAddress, provider]);

  return isMultisig;
}
