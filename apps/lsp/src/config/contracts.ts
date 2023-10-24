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
      address: "0x307770388c483BF225DCbe55EE5BA8b9d0bC5C1d",
      abi: stakingABI,
    },
    [ContractName.METH]: {
      address: "0x20d7E093B3fa5eBfA7a0fa414FaD547743a2400F",
      abi: methABI,
    },
    [ContractName.Oracle]: {
      address: "0x4870BFEDE0d313629169750C125F9658E6EdfdB2",
      abi: oracleABI,
    },
    [ContractName.ReturnsAggregator]: {
      address: "0x94c0a0C3C22951BD40CA2490DbD5aebE910e7B95",
      abi: returnsAggregatorABI,
    },
    [ContractName.Pauser]: {
      address: "0xF1331e8aaEC8e7E9060530A1cd95377B2f02a11e",
      abi: pauserABI,
    },
  },
};
