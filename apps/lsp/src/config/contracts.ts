import {
  methABI,
  oracleABI,
  pauserABI,
  returnsAggregatorABI,
  stakingABI,
} from "@abi/abis";
import { Address } from "wagmi";

export enum ContractName {
  Staking = "staking",
  METH = "mETH",
  Oracle = "oracle",
  ReturnsAggregator = "returnsAggregator",
  Pauser = "pauser",
}

type Contract<T> = {
  address: Address;
  abi: T;
};

type ContractConfig = {
  [ContractName.Staking]: Contract<typeof stakingABI>;
  [ContractName.METH]: Contract<typeof methABI>;
  [ContractName.Oracle]: Contract<typeof oracleABI>;
  [ContractName.ReturnsAggregator]: Contract<typeof returnsAggregatorABI>;
  [ContractName.Pauser]: Contract<typeof pauserABI>;
};

export const contracts: Record<number, ContractConfig> = {
  1: {
    [ContractName.Staking]: {
      address: "0xe3cBd06D7dadB3F4e6557bAb7EdD924CD1489E8f",
      abi: stakingABI,
    },
    [ContractName.METH]: {
      address: "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa",
      abi: methABI,
    },
    [ContractName.Oracle]: {
      address: "0x8735049F496727f824Cc0f2B174d826f5c408192",
      abi: oracleABI,
    },
    [ContractName.ReturnsAggregator]: {
      address: "0x1766be66fBb0a1883d41B4cfB0a533c5249D3b82",
      abi: returnsAggregatorABI,
    },
    [ContractName.Pauser]: {
      address: "0x29Ab878aEd032e2e2c86FF4A9a9B05e3276cf1f8",
      abi: pauserABI,
    },
  },
  5: {
    [ContractName.Staking]: {
      address: "0xbC286707d7970a5297aaFE6d4528cfc07ffeb3Df",
      abi: stakingABI,
    },
    [ContractName.METH]: {
      address: "0xF2014366064509ddf17F6a79b319fF4798687259",
      abi: methABI,
    },
    [ContractName.Oracle]: {
      address: "0xfE23632bc2972dEFcB1d0D0CeB3444810a1Af91B",
      abi: oracleABI,
    },
    [ContractName.ReturnsAggregator]: {
      address: "0x2b6a26eFc6168EE6Ee636A623BC10f1EC7990cf5",
      abi: returnsAggregatorABI,
    },
    [ContractName.Pauser]: {
      address: "0xE89A49B3FA7212ca99e82D8aED210d70B4a3A08d",
      abi: pauserABI,
    },
  },
};
