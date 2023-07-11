// All numeric values will be handled as BigNumbers
import type { BigNumber } from "ethers";

// Each sync will be provided its own provider
import type { providers } from "ethers/lib/ethers";

// Handler definitions to map eventName to handler
export type Handlers = {
  [key: string]: (
    args: any,
    {
      tx,
      block,
    }: {
      tx: providers.TransactionReceipt;
      block: providers.Block;
    }
  ) => void;
};

// Mappings definition, to map handlers to contracts
export type Mappings = {
  handlers: {
    [key: string]: Handlers;
  };
  register: {
    handlers: Handlers | keyof Mappings["handlers"];
    rpcUrl: string;
    abi: string[];
    address: string;
    startBlock: number;
  }[];
};

// Definitions for the Approval Events args (as defined in the abi)
export type ApprovalEvent = {
  owner: string;
  spender: string;
  value: BigNumber;
};

// Definitions for the DelegateChanged Events args (as defined in the abi)
export type DelegateChangedEvent = {
  delegator: string;
  fromDelegate: string;
  toDelegate: string;
};

// Definitions for the DelegateVotesChanged Events args (as defined in the abi)
export type DelegateVotesChangedEvent = {
  delegate: string;
  previousBalance: BigNumber;
  newBalance: BigNumber;
};

// Definitions for the Initialized Events args (as defined in the abi)
export type InitializedEvent = {
  version: BigNumber;
};

// Definitions for the MintCapNumeratorChanged Events args (as defined in the abi)
export type MintCapNumeratorChangedEvent = {
  from: string;
  previousMintCapNumerator: BigNumber;
  newMintCapNumerator: BigNumber;
};

// Definitions for the OwnershipTransferred Events args (as defined in the abi)
export type OwnershipTransferredEvent = {
  previousOwner: string;
  newOwner: string;
};

// Definitions for the Transferred Events args (as defined in the abi)
export type TransferEvent = {
  from: string;
  to: string;
  value: string;
};

// Delegate entity definition
export type DelegateEntity = {
  id: string;
  bitTo: string;
  mntTo: string;
  balance: BigNumber;
  mntBalance: BigNumber;
  bitBalance: BigNumber;
  votes: BigNumber;
  mntVotes: BigNumber;
  bitVotes: BigNumber;
  delegatorsCount: BigNumber;
  mntDelegatorsCount: BigNumber;
  bitDelegatorsCount: BigNumber;
  blockNumber: number;
  transactionHash: string;
};
