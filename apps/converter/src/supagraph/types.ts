// All numeric values will be handled as BigNumbers
import type { BigNumber } from "ethers";

// Each sync will be provided its own provider
import type { BigNumberish, providers } from "ethers/lib/ethers";

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

// Definitions for the TokensMigrated Events args (as defined in the abi)
export type TokensMigratedEvent = {
  to: string;
  amountSwapped: BigNumber;
  amountReceived?: BigNumber;
};

// Account entity definition
export type AccountEntity = {
  id: string;
  migratedMnt: BigNumberish;
  migrationCount: BigNumberish;
  blockNumber: BigNumberish;
  transactionHash: String;
};

// Delegation entity definition
export type MigationEntity = {
  id: string;
  account: string;
  amountSwapped: BigNumberish;
  blockTimestamp: BigNumberish;
  blockNumber: BigNumberish;
  transactionHash: string;
};
