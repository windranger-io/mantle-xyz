import { BigNumber } from "ethers";

// Definitions for the Events args (as defined in the abi)
export type StateBatchAppendedEvent = {
  batchRoot: string;
  batchIndex: string;
  batchSize: string;
  prevTotalElements: string;
  signature: string;
  extraData: string;
};

// Definitions for the entity we're saving on each L1StateBatchAppendedEvent
export type StateBatchAppendedEntity = {
  id: string;
  batchRoot: string;
  batchIndex: string;
  batchSize: string;
  prevTotalElements: string;
  signature: string;
  extraData: string;
  txBlock: number;
  txHash: string;
  txIndex: number;
};

// Definitions for the ERC20DepositInitiated Events args (as defined in the abi)
export type ERC20DepositInitiated = {
  _l1Token: string;
  _l2Token: string;
  _from: string;
  _to: string;
  _amount: BigNumber;
  _data: string;
};

// Definitions for the ETHDepositInitiated Events args (as defined in the abi)
export type ETHDepositInitiated = {
  _from: string;
  _to: string;
  _amount: BigNumber;
  _data: string;
};

// Definitions for the entity we're saving for each L1ToL2Message
export type L1ToL2MessageEntity = {
  id: string;
  status: number;
  from: string;
  messageNonce: BigNumber;
  sender: string;
  target: string;
  value: BigNumber;
  minGasLimit: BigNumber;
  message: string;
  amount: BigNumber;
  l1Tx: string;
  l2Tx?: string;
  l1BlockNumber?: number;
  l2BlockNumber?: number;
  l1Token?: string;
  l2Token?: string;
  gasDropped?: boolean;
};

// Definitions for the RelayedMessage Events args (as defined in the abi)
export type RelayedMessage = {
  msgHash: string;
};

// Definitions for the FailedRelayedMessage Events args (as defined in the abi)
export type FailedRelayedMessage = {
  msgHash: string;
};
