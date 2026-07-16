import { CHAINS_FORMATTED } from "@config/constants";
import { providers } from "ethers";

// How long (ms) to wait on a stalled RPC before racing the next one in the pool.
const STALL_TIMEOUT = 1500;

// Reuse one provider per chain instead of rebuilding it on every query refetch.
const providerCache = new Map<number, providers.BaseProvider>();

/**
 * Build an ethers provider that fails over across every RPC configured for the
 * chain. Public endpoints (rpcUrls.public) are tried first; the keyed default
 * endpoint (rpcUrls.default, e.g. Alchemy) is the last resort, so its quota is
 * only spent when every public node is stalling or down.
 *
 * Each child is constructed with an explicit network, so there is no eth_chainId
 * round-trip on construction and `provider.network` is available synchronously
 * (useGasEstimate reads it).
 */
export function getFallbackProvider(chainId: number): providers.BaseProvider {
  const cached = providerCache.get(chainId);
  if (cached) return cached;

  const chain = CHAINS_FORMATTED[chainId];
  if (!chain) {
    throw new Error(
      `getFallbackProvider: no chain config for chainId ${chainId}`
    );
  }

  // public pool first, keyed default last — falsy entries dropped, then de-duped
  const urls = [
    ...chain.rpcUrls.public.http,
    ...chain.rpcUrls.default.http,
  ].filter(Boolean);
  const uniqueUrls = Array.from(new Set(urls));

  if (uniqueUrls.length === 0) {
    throw new Error(`getFallbackProvider: no RPC urls for chainId ${chainId}`);
  }

  const network = { chainId, name: chain.network };

  const provider =
    uniqueUrls.length === 1
      ? new providers.StaticJsonRpcProvider(uniqueUrls[0], network)
      : new providers.FallbackProvider(
          uniqueUrls.map((url, index) => ({
            provider: new providers.StaticJsonRpcProvider(url, network),
            priority: index + 1, // lower = preferred; public pool 1..n, default last
            stallTimeout: STALL_TIMEOUT,
            weight: 1,
          })),
          1 // quorum: a single successful response is enough
        );

  providerCache.set(chainId, provider);
  return provider;
}
