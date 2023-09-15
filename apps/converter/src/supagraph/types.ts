// All numeric values will be handled as BigNumbers
import type { BigNumber } from "ethers";

// Each sync will be provided its own provider
import type { BigNumberish } from "ethers/lib/ethers";

// Definitions for the TokensMigrated Events args (as defined in the abi)
export type TokensMigratedEvent = {
  to: string;
  amountSwapped: BigNumber;
  amountReceived?: BigNumber;
};

// Definitions for the TokenMigrationApproved Events args (as defined in the abi)
export type TokenMigrationApprovedEvent = {
  approver: string;
  user: string;
  amount: BigNumber;
};

// Definitions for the Approval Events args (as defined in the abi)
export type ApprovalEvent = {
  owner: string;
  spender: string;
  value: BigNumber;
};

// Account entity definition
export type AccountEntity = {
  id: string;
  migratedMnt: BigNumberish;
  migrationCount: BigNumberish;
  migrationCountV2: BigNumberish;
  blockNumber: BigNumberish;
  transactionHash: String;
};

// Delegation entity definition
export type MigationEntity = {
  id: string;
  account: string;
  amountSwapped: BigNumberish;
  amountApproved: BigNumberish;
  gasCost: BigNumberish;
  blockTimestamp: BigNumberish;
  blockNumber: BigNumberish;
  transactionHash: string;
  refunded: boolean;
  refundTx: string;
  approvedBy: string;
  approvalTx: string;
  approvalBlockTimestamp: number;
  approvalBlockNumber: number;
  status: string;
};
