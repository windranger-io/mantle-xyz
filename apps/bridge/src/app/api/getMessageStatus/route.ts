import { NextRequest, NextResponse } from "next/server";
import { CrossChainMessenger, MessageStatus } from "@mantleio/sdk";
import { providers } from "ethers";
import {
  CHAINS_FORMATTED,
  IS_MANTLE_V2,
  L1_CHAIN_ID,
  L2_CHAIN_ID,
} from "@config/constants";

const layer1Provider = new providers.JsonRpcProvider(
  CHAINS_FORMATTED[L1_CHAIN_ID].rpcUrls.default.http[0]
);
const layer2Provider = new providers.JsonRpcProvider(
  CHAINS_FORMATTED[L2_CHAIN_ID].rpcUrls.public.http[0]
);
const crossChainMessenger = new CrossChainMessenger({
  l1ChainId: L1_CHAIN_ID,
  l2ChainId: L2_CHAIN_ID,
  l1SignerOrProvider: layer1Provider,
  l2SignerOrProvider: layer2Provider,
  bedrock: IS_MANTLE_V2,
});
export async function GET(request: NextRequest) {
  const s = request.nextUrl?.searchParams;
  const txhash: string | null = s.get("txhash");
  console.log(txhash);
  if (!s || !txhash) {
    return NextResponse.json({});
  }
  const status: MessageStatus = await crossChainMessenger.getMessageStatus(
    txhash
  );
  return NextResponse.json({ status });
}
