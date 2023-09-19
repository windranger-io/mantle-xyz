import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { Address, useContractRead, useSignTypedData } from "wagmi";

type UsePermitResult = {
  data?: `0x${string}`;
  isError: boolean;
  isLoading: boolean;
  signTypedDataAsync: any; // Unsure how to type this as the return type of useSignTypedData is not exported
};

export default function usePermitApproval({
  methAmount,
  deadline,
  address,
}: {
  methAmount: bigint;
  deadline: bigint;
  address?: Address;
}): UsePermitResult {
  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];
  const methContract = contracts[CHAIN_ID][ContractName.METH];

  const nonces = useContractRead({
    ...methContract,
    functionName: "nonces",
    args: [address!],
    enabled: Boolean(address) && methAmount > 0,
  });

  const types = {
    EIP712Domain: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "version",
        type: "string",
      },
      {
        name: "chainId",
        type: "uint256",
      },
      {
        name: "verifyingContract",
        type: "address",
      },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  const domain = {
    name: "mETH",
    version: "1",
    chainId: CHAIN_ID as any as bigint,
    verifyingContract: methContract.address,
  } as const;

  const message = {
    owner: address!,
    spender: stakingContract.address,
    value: methAmount,
    nonce: nonces?.data || BigInt(0),
    deadline,
  } as const;

  // useSignTypedData will use the selected account to sign data
  const { data, isError, isLoading, signTypedDataAsync } = useSignTypedData({
    types,
    domain,
    message,
    primaryType: "Permit",
  });

  return {
    data,
    isError,
    isLoading,
    signTypedDataAsync,
  };
}
