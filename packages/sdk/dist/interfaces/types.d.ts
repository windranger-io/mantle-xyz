import { Provider, TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Contract, BigNumber } from 'ethers';
import { CrossChainMessenger } from '../cross-chain-messenger';
import { IBridgeAdapter } from './bridge-adapter';
export declare enum L1ChainID {
    MAINNET = 1,
    GOERLI = 5,
    SEPOLIA = 11155111,
    HARDHAT_LOCAL = 31337,
    BEDROCK_LOCAL_DEVNET = 900
}
export declare enum L2ChainID {
    MANTLE = 5000,
    MANTLE_TESTNET = 5001,
    MANTLE_GOERLIQA = 1705003,
    MANTLE_KOVAN = 69,
    MANTLE_HARDHAT_LOCAL = 31337,
    MANTLE_HARDHAT_DEVNET = 17,
    MANTLE_V2_LOCAL_DEVNET = 901,
    MANTLE_SEPOLIA_TESTNET = 5003,
    MANTLE_SEPOLIA_QA3 = 5003003
}
export interface OEL1Contracts {
    AddressManager: Contract;
    L1CrossDomainMessenger: Contract;
    L1StandardBridge: Contract;
    StateCommitmentChain: Contract;
    CanonicalTransactionChain: Contract;
    BondManager: Contract;
    Rollup: Contract;
    OptimismPortal: Contract;
    L2OutputOracle: Contract;
}
export interface OEL2Contracts {
    L2CrossDomainMessenger: Contract;
    L2StandardBridge: Contract;
    L2ToL1MessagePasser: Contract;
    BVM_L1BlockNumber: Contract;
    BVM_L2ToL1MessagePasser: Contract;
    BVM_DeployerWhitelist: Contract;
    BVM_ETH: Contract;
    BVM_GasPriceOracle: Contract;
    BVM_SequencerFeeVault: Contract;
    WETH: Contract;
    BVM_MANTLE: Contract;
    TssRewardContract: Contract;
    BedrockMessagePasser: Contract;
}
export interface OEContracts {
    l1: OEL1Contracts;
    l2: OEL2Contracts;
}
export type OEL1ContractsLike = {
    [K in keyof OEL1Contracts]: AddressLike;
};
export type OEL2ContractsLike = {
    [K in keyof OEL2Contracts]: AddressLike;
};
export interface OEContractsLike {
    l1: OEL1ContractsLike;
    l2: OEL2ContractsLike;
}
export interface BridgeAdapterData {
    [name: string]: {
        Adapter: new (opts: {
            messenger: CrossChainMessenger;
            l1Bridge: AddressLike;
            l2Bridge: AddressLike;
        }) => IBridgeAdapter;
        l1Bridge: AddressLike;
        l2Bridge: AddressLike;
    };
}
export interface BridgeAdapters {
    [name: string]: IBridgeAdapter;
}
export declare enum MessageStatus {
    UNCONFIRMED_L1_TO_L2_MESSAGE = 0,
    FAILED_L1_TO_L2_MESSAGE = 1,
    STATE_ROOT_NOT_PUBLISHED = 2,
    READY_TO_PROVE = 3,
    IN_CHALLENGE_PERIOD = 4,
    READY_FOR_RELAY = 5,
    RELAYED = 6
}
export declare enum MessageDirection {
    L1_TO_L2 = 0,
    L2_TO_L1 = 1
}
export interface CrossChainMessageRequest {
    direction: MessageDirection;
    target: string;
    message: string;
}
export interface CoreCrossChainMessage {
    sender: string;
    target: string;
    message: string;
    messageNonce: BigNumber;
    mntValue: BigNumber;
    ethValue: BigNumber;
    minGasLimit: BigNumber;
}
export interface CrossChainMessage extends CoreCrossChainMessage {
    direction: MessageDirection;
    logIndex: number;
    blockNumber: number;
    transactionHash: string;
}
export type LowLevelMessage = CoreCrossChainMessage;
export interface TokenBridgeMessage {
    direction: MessageDirection;
    from: string;
    to: string;
    l1Token: string;
    l2Token: string;
    amount: BigNumber;
    data: string;
    logIndex: number;
    blockNumber: number;
    transactionHash: string;
}
export interface WithdrawalEntry {
    MessagePassed: any;
}
export declare enum MessageReceiptStatus {
    RELAYED_FAILED = 0,
    RELAYED_SUCCEEDED = 1
}
export interface MessageReceipt {
    receiptStatus: MessageReceiptStatus;
    transactionReceipt: TransactionReceipt;
}
export interface ProvenWithdrawal {
    outputRoot: string;
    timestamp: BigNumber;
    l2BlockNumber: BigNumber;
}
export interface StateRootBatchHeader {
    batchIndex: BigNumber;
    batchRoot: string;
    batchSize: BigNumber;
    prevTotalElements: BigNumber;
    signature: string;
    extraData: string;
}
export interface StateRoot {
    stateRoot: string;
    stateRootIndexInBatch: number;
    batch: StateRootBatch;
}
export interface StateRootBatch {
    blockNumber: number;
    header: StateRootBatchHeader;
    stateRoots: string[];
}
export interface CrossChainMessageProof {
    stateRoot: string;
    stateRootBatchHeader: StateRootBatchHeader;
    stateRootProof: {
        index: number;
        siblings: string[];
    };
    stateTrieWitness: string;
    storageTrieWitness: string;
}
export type TransactionLike = string | TransactionReceipt | TransactionResponse;
export type MessageLike = CrossChainMessage | TransactionLike | TokenBridgeMessage;
export type MessageRequestLike = CrossChainMessageRequest | CrossChainMessage | TransactionLike | TokenBridgeMessage;
export type ProviderLike = string | Provider;
export type SignerLike = string | Signer;
export type SignerOrProviderLike = SignerLike | ProviderLike;
export type AddressLike = string | Contract;
export type NumberLike = string | number | BigNumber;
