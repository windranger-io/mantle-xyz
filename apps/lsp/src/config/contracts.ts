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
      address: "0xEB5812Ee87bE867375C7B2B6DEEC1424E0b6184d",
      abi: stakingABI,
    },
    [ContractName.METH]: {
      address: "0x84e3C88fb1656e4beE355b9d248e5D60003228F5",
      abi: methABI,
    },
    [ContractName.Oracle]: {
      address: "0xe70d89506d8B6a12276a816b58138031A5C94deb",
      abi: oracleABI,
    },
    [ContractName.ReturnsAggregator]: {
      address: "0xD237CDFD9FeF28a4b558e08D1f4F4D4A636664E6",
      abi: returnsAggregatorABI,
    },
    [ContractName.Pauser]: {
      address: "0x62c5974312F91CD23Af85F19c0bcc612B711B9e0",
      abi: pauserABI,
    },
  },
};
