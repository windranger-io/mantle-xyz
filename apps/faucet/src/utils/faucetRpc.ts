import { FAUCET_API_URL } from "@config/constants";

let rpcId = 0;

export type EligibilityResult = {
  eligible: boolean;
  registered: boolean;
  dailyLimit: string;
  dailyClaimed: string;
  remaining: string;
};

async function rpcCall<T>(
  url: string,
  method: string,
  params: unknown[] = []
): Promise<T> {
  rpcId += 1;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: rpcId,
      method,
      params,
    }),
  });

  const json = await res.json();

  if (json.error) {
    throw new Error(json.error.message || "RPC error");
  }

  return json.result as T;
}

/** Check eligibility — does NOT auto-register (chain-agnostic) */
export async function faucetEligibility(
  address: string
): Promise<EligibilityResult> {
  return rpcCall<EligibilityResult>(FAUCET_API_URL, "faucet_eligibility", [
    address,
  ]);
}

/** Register user — call only after Twitter auth (chain-agnostic) */
export async function faucetRegister(address: string): Promise<boolean> {
  return rpcCall<boolean>(FAUCET_API_URL, "faucet_register", [address]);
}

/** Claim MNT — chain-specific */
export async function faucetRequestMNT(
  address: string,
  amountWei: string,
  chainId: number
): Promise<null> {
  return rpcCall<null>(
    `${FAUCET_API_URL}/chain/${chainId}`,
    "faucet_requestMNT",
    [address, amountWei]
  );
}

/** Get faucet reserve balance (wei string) — chain-specific */
export async function faucetBalance(chainId: number): Promise<string> {
  return rpcCall<string>(
    `${FAUCET_API_URL}/chain/${chainId}`,
    "faucet_balance",
    []
  );
}
