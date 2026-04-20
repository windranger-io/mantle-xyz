import { FAUCET_API_URL, L1_CHAIN_ID } from "@config/constants";

let rpcId = 0;

export type EligibilityResult = {
  eligible: boolean;
  registered: boolean;
  dailyLimit: string;
  dailyClaimed: string;
  remaining: string;
};

async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
  rpcId += 1;
  const res = await fetch(`${FAUCET_API_URL}/chain/${L1_CHAIN_ID}`, {
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

/** Check eligibility — does NOT auto-register */
export async function faucetEligibility(
  address: string
): Promise<EligibilityResult> {
  return rpcCall<EligibilityResult>("faucet_eligibility", [address]);
}

/** Register user — call only after Twitter auth */
export async function faucetRegister(address: string): Promise<boolean> {
  return rpcCall<boolean>("faucet_register", [address]);
}

/** Claim MNT */
export async function faucetRequestMNT(
  address: string,
  amountWei: string
): Promise<null> {
  return rpcCall<null>("faucet_requestMNT", [address, amountWei]);
}
