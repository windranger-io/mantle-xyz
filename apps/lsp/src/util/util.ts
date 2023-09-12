import { AMOUNT_MAX_DISPLAY_DIGITS } from "@config/constants";
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
  return formatEther(x).substring(0, AMOUNT_MAX_DISPLAY_DIGITS);
};
