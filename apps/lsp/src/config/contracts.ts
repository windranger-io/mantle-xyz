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
      address: "0x72E6a6D798BE85157f4EC8D71444cDd2a7612d3D",
      abi: stakingABI,
    },
    [ContractName.METH]: {
      address: "0x8E412276c6da0eD07179C23B19A62e8CD44D2552",
      abi: methABI,
    },
    [ContractName.Oracle]: {
      address: "0x86b483eC87e6aD32b31E0dEbDD2b4b6de2119ea2",
      abi: oracleABI,
    },
    [ContractName.ReturnsAggregator]: {
      address: "0x4ae5cB35b0405aAF8ee8A33aE407aBD9fE93d985",
      abi: returnsAggregatorABI,
    },
    [ContractName.Pauser]: {
      address: "0x9D97Fe3D64B506AE9B273cd0AB6842844F97ac69",
      abi: pauserABI,
    },
  },
};
