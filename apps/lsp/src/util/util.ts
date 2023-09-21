import { AMOUNT_MAX_DISPLAY_DIGITS, CHAIN_ID } from "@config/constants";
import { BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";

const SLIPPAGE_BASIS_POINTS = BigInt(50);
const BASIS_POINTS_DENOMINATOR = BigInt(10000);

export const getMinimumAmount = (x?: bigint) => {
  if (!x) {
    return BigInt(0);
  }
  return (
    (x * (BASIS_POINTS_DENOMINATOR - SLIPPAGE_BASIS_POINTS)) /
    BASIS_POINTS_DENOMINATOR
  );
};

export const formatEthTruncated = (x: BigNumberish) => {
  const truncated = formatEther(x).substring(0, AMOUNT_MAX_DISPLAY_DIGITS);
  return truncated.replace(/\.?0+$/, "");
};

export enum NodeOperator {
  Blockdaemon = 1,
  P2P = 2,
}

const beaconchainPrefixes: Record<5 | 1, string> = {
  5: "https://goerli.beaconcha.in",
  1: "https://beaconcha.in",
};

export function beaconchainValidatorLink(id: string) {
  return `${beaconchainPrefixes[CHAIN_ID]}/validator/${id}`;
}
