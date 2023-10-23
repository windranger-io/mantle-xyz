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
      address: "0x33A5fa3C07AB3AFCC2112d24A4076BA8ABCE21fE",
      abi: stakingABI,
    },
    [ContractName.METH]: {
      address: "0xc7fcE3be043601032e22267978b4A91438765315",
      abi: methABI,
    },
    [ContractName.Oracle]: {
      address: "0x0799E7dfC6CC666A6643299ab86BB5811fA80209",
      abi: oracleABI,
    },
    [ContractName.ReturnsAggregator]: {
      address: "0xD04464efd4c79a563925F058497D85A404F2C97d",
      abi: returnsAggregatorABI,
    },
    [ContractName.Pauser]: {
      address: "0x989a800b6FC81E39d8988bE4427A3aCCbe40C3e4",
      abi: pauserABI,
    },
  },
};
