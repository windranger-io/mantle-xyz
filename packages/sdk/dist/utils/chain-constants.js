"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRIDGE_ADAPTER_DATA = exports.CONTRACT_ADDRESSES = exports.DEFAULT_L2_CONTRACT_ADDRESSES = exports.CHAIN_BLOCK_TIMES = exports.DEPOSIT_CONFIRMATION_BLOCKS = void 0;
const contracts_1 = require("@mantleio/contracts");
const contracts_bedrock_1 = require("@mantleio/contracts-bedrock");
const interfaces_1 = require("../interfaces");
const adapters_1 = require("../adapters");
exports.DEPOSIT_CONFIRMATION_BLOCKS = {
    [interfaces_1.L2ChainID.MANTLE]: 50,
    [interfaces_1.L2ChainID.MANTLE_TESTNET]: 50,
    [interfaces_1.L2ChainID.MANTLE_GOERLIQA]: 12,
    [interfaces_1.L2ChainID.MANTLE_KOVAN]: 12,
    [interfaces_1.L2ChainID.MANTLE_HARDHAT_LOCAL]: 2,
    [interfaces_1.L2ChainID.MANTLE_HARDHAT_DEVNET]: 2,
    [interfaces_1.L2ChainID.MANTLE_V2_LOCAL_DEVNET]: 2,
    [interfaces_1.L2ChainID.MANTLE_SEPOLIA_TESTNET]: 12,
    [interfaces_1.L2ChainID.MANTLE_SEPOLIA_QA3]: 12,
};
exports.CHAIN_BLOCK_TIMES = {
    [interfaces_1.L1ChainID.MAINNET]: 13,
    [interfaces_1.L1ChainID.GOERLI]: 15,
    [interfaces_1.L1ChainID.HARDHAT_LOCAL]: 1,
    [interfaces_1.L1ChainID.BEDROCK_LOCAL_DEVNET]: 15,
    [interfaces_1.L1ChainID.SEPOLIA]: 2,
};
exports.DEFAULT_L2_CONTRACT_ADDRESSES = {
    L2CrossDomainMessenger: contracts_1.predeploys.L2CrossDomainMessenger || contracts_bedrock_1.predeploys.L2CrossDomainMessenger || '0x4200000000000000000000000000000000000007',
    L2ToL1MessagePasser: contracts_1.predeploys.BVM_L2ToL1MessagePasser || contracts_bedrock_1.predeploys.L2ToL1MessagePasser || '0x4200000000000000000000000000000000000000',
    L2StandardBridge: contracts_1.predeploys.L2StandardBridge || contracts_bedrock_1.predeploys.L2StandardBridge || '0x4200000000000000000000000000000000000010',
    BVM_L1BlockNumber: contracts_1.predeploys.BVM_L1BlockNumber || contracts_bedrock_1.predeploys.L1BlockNumber || '0x4200000000000000000000000000000000000013',
    BVM_L2ToL1MessagePasser: contracts_1.predeploys.BVM_L2ToL1MessagePasser || contracts_bedrock_1.predeploys.L2ToL1MessagePasser || '0x4200000000000000000000000000000000000000',
    BVM_DeployerWhitelist: contracts_1.predeploys.BVM_DeployerWhitelist || '0x4200000000000000000000000000000000000002',
    BVM_ETH: contracts_1.predeploys.BVM_ETH || contracts_bedrock_1.predeploys.BVM_ETH || '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
    BVM_GasPriceOracle: contracts_1.predeploys.BVM_GasPriceOracle || contracts_bedrock_1.predeploys.GasPriceOracle || '0x420000000000000000000000000000000000000F',
    BVM_SequencerFeeVault: contracts_1.predeploys.BVM_SequencerFeeVault || contracts_bedrock_1.predeploys.SequencerFeeVault || '0x4200000000000000000000000000000000000011',
    WETH: contracts_1.predeploys.WETH9,
    BedrockMessagePasser: contracts_bedrock_1.predeploys.L2ToL1MessagePasser || '0x4200000000000000000000000000000000000000',
    BVM_MANTLE: contracts_1.predeploys.LegacyERC20Mantle,
    TssRewardContract: contracts_1.predeploys.TssRewardContract,
};
exports.CONTRACT_ADDRESSES = {
    [interfaces_1.L2ChainID.MANTLE]: {
        l1: {
            AddressManager: '0x6968f3F16C3e64003F02E121cf0D5CCBf5625a42',
            L1CrossDomainMessenger: '0x676A795fe6E43C17c668de16730c3F690FEB7120',
            L1StandardBridge: '0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012',
            StateCommitmentChain: '0x89E9D387555AF0cDE22cb98833Bae40d640AD7fa',
            CanonicalTransactionChain: '0x291dc3819b863e19b0a9b9809F8025d2EB4aaE93',
            BondManager: '0x31aBe1c466C2A8b95fd84258dD1471472979B650',
            Rollup: process.env.Rollup ||
                '0xD1328C9167e0693B689b5aa5a024379d4e437858',
            OptimismPortal: '0x0000000000000000000000000000000000000000',
            L2OutputOracle: '0x0000000000000000000000000000000000000000',
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_TESTNET]: {
        l1: {
            AddressManager: '0xA647F5947C50248bc4b2eF773791c9C2bc01C65A',
            L1CrossDomainMessenger: '0x7Bfe603647d5380ED3909F6f87580D0Af1B228B4',
            L1StandardBridge: '0xc92470D7Ffa21473611ab6c6e2FcFB8637c8f330',
            StateCommitmentChain: '0x91A5D806BA73d0AA4bFA9B318126dDE60582e92a',
            CanonicalTransactionChain: '0x654e6dF111F98374d9e5d908D7a5392C308aA18D',
            BondManager: '0xeBE3f28BbFa7bB8f2C066C1A792073203B985e27',
            Rollup: process.env.Rollup ||
                '0x95d82F64C84A69338e7DE18612AcC86C50eB57D6',
            OptimismPortal: process.env.OptimismPortal || '0x2eD00c9eefD29Ba89F5134ba4aeE695e42702DcC',
            L2OutputOracle: process.env.L2OutputOracle || '0x70dd17020ae9EFcDD2b7c306AfDC0D98c906d7AD',
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_HARDHAT_LOCAL]: {
        l1: {
            AddressManager: process.env.ADDRESS_MANAGER_ADDRESS ||
                '0x92aBAD50368175785e4270ca9eFd169c949C4ce1',
            L1CrossDomainMessenger: process.env.L1_CROSS_DOMAIN_MESSENGER_ADDRESS ||
                '0x7959CF3b8ffC87Faca8aD8a1B5D95c0f58C0BEf8',
            L1StandardBridge: process.env.L1_STANDARD_BRIDGE_ADDRESS ||
                '0x8BAccFF561FDe61D6bC8B6f299fFBa561d2189B9',
            StateCommitmentChain: process.env.STATE_COMMITMENT_CHAIN_ADDRESS ||
                '0xd9e2F450525079e1e29fB23Bc7Caca6F61f8fD4a',
            CanonicalTransactionChain: process.env.CANONICAL_TRANSACTION_CHAIN_ADDRESS ||
                '0x0090171f848B2aa86918E5Ef2406Ab3d424fdd83',
            BondManager: process.env.BOND_MANAGER_ADDRESS ||
                '0x9faB987C9C469EB23Da31B7848B28aCf30905eA8',
            Rollup: process.env.Rollup ||
                '0x9faB987C9C469EB23Da31B7848B28aCf30905eA8',
            OptimismPortal: process.env.OptimismPortal || '0x0000000000000000000000000000000000000000',
            L2OutputOracle: process.env.L2OutputOracle || '0x0000000000000000000000000000000000000000',
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_HARDHAT_DEVNET]: {
        l1: {
            AddressManager: process.env.ADDRESS_MANAGER_ADDRESS ||
                '0x92aBAD50368175785e4270ca9eFd169c949C4ce1',
            L1CrossDomainMessenger: process.env.L1_CROSS_DOMAIN_MESSENGER_ADDRESS ||
                '0x7959CF3b8ffC87Faca8aD8a1B5D95c0f58C0BEf8',
            L1StandardBridge: process.env.L1_STANDARD_BRIDGE_ADDRESS ||
                '0x8BAccFF561FDe61D6bC8B6f299fFBa561d2189B9',
            StateCommitmentChain: process.env.STATE_COMMITMENT_CHAIN_ADDRESS ||
                '0xd9e2F450525079e1e29fB23Bc7Caca6F61f8fD4a',
            CanonicalTransactionChain: process.env.CANONICAL_TRANSACTION_CHAIN_ADDRESS ||
                '0x0090171f848B2aa86918E5Ef2406Ab3d424fdd83',
            BondManager: process.env.BOND_MANAGER_ADDRESS ||
                '0x9faB987C9C469EB23Da31B7848B28aCf30905eA8',
            Rollup: process.env.Rollup ||
                '0x9faB987C9C469EB23Da31B7848B28aCf30905eA8',
            OptimismPortal: process.env.OptimismPortal || '0x0000000000000000000000000000000000000000',
            L2OutputOracle: process.env.L2OutputOracle || '0x0000000000000000000000000000000000000000',
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_V2_LOCAL_DEVNET]: {
        l1: {
            AddressManager: '0x6900000000000000000000000000000000000005',
            L1CrossDomainMessenger: '0x6900000000000000000000000000000000000002',
            L1StandardBridge: '0x6900000000000000000000000000000000000003',
            StateCommitmentChain: '0x0000000000000000000000000000000000000000',
            CanonicalTransactionChain: '0x0000000000000000000000000000000000000000',
            BondManager: '0x0000000000000000000000000000000000000000',
            OptimismPortal: '0x6900000000000000000000000000000000000001',
            L2OutputOracle: '0x6900000000000000000000000000000000000000',
            Rollup: process.env.Rollup || '0x0000000000000000000000000000000000000000'
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_KOVAN]: {
        l1: {
            AddressManager: '0x100Dd3b414Df5BbA2B542864fF94aF8024aFdf3a',
            L1CrossDomainMessenger: '0x4361d0F75A0186C05f971c566dC6bEa5957483fD',
            L1StandardBridge: '0x22F24361D548e5FaAfb36d1437839f080363982B',
            StateCommitmentChain: '0xD7754711773489F31A0602635f3F167826ce53C5',
            CanonicalTransactionChain: '0xf7B88A133202d41Fe5E2Ab22e6309a1A4D50AF74',
            BondManager: '0xc5a603d273E28185c18Ba4d26A0024B2d2F42740',
            Rollup: process.env.Rollup ||
                '0x9faB987C9C469EB23Da31B7848B28aCf30905eA8',
            OptimismPortal: process.env.OptimismPortal || "0x0000000000000000000000000000000000000000",
            L2OutputOracle: process.env.L2OutputOracle || "0x0000000000000000000000000000000000000000"
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_GOERLIQA]: {
        l1: {
            AddressManager: process.env.ADDRESS_MANAGER_ADDRESS ||
                '0x327903410307971Ca7Ba8A6CB2291D3b8825d7F5',
            L1CrossDomainMessenger: process.env.L1_CROSS_DOMAIN_MESSENGER_ADDRESS ||
                '0x3f41DAcb2dB659e45826126d004ad3E0C8eA680e',
            L1StandardBridge: process.env.L1_STANDARD_BRIDGE_ADDRESS ||
                '0x4cf99b9BC9B2Da64033D1Fb65146Ea60fbe8AD4B',
            StateCommitmentChain: process.env.STATE_COMMITMENT_CHAIN_ADDRESS ||
                '0x88EC574e2ef0EcF9043373139099f7E535F94dBC',
            CanonicalTransactionChain: process.env.CANONICAL_TRANSACTION_CHAIN_ADDRESS ||
                '0x258e80D5371fD7fFdDFE29E60b366f9FC44844c8',
            BondManager: process.env.BOND_MANAGER_ADDRESS ||
                '0xc723Cb5f3337c2F6Eab9b29E78CE42a28B8661d1',
            Rollup: process.env.Rollup ||
                '0x9faB987C9C469EB23Da31B7848B28aCf30905eA8',
            OptimismPortal: process.env.OptimismPortal || "0x0000000000000000000000000000000000000000",
            L2OutputOracle: process.env.L2OutputOracle || "0x0000000000000000000000000000000000000000"
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_SEPOLIA_TESTNET]: {
        l1: {
            AddressManager: process.env.ADDRESS_MANAGER_ADDRESS ||
                '0x1183d0ec537175827C4683f579e92FdfE2466F89',
            L1CrossDomainMessenger: process.env.L1_CROSS_DOMAIN_MESSENGER_ADDRESS ||
                '0x37dAC5312e31Adb8BB0802Fc72Ca84DA5cDfcb4c',
            L1StandardBridge: process.env.L1_STANDARD_BRIDGE_ADDRESS ||
                '0x21F308067241B2028503c07bd7cB3751FFab0Fb2',
            StateCommitmentChain: process.env.STATE_COMMITMENT_CHAIN_ADDRESS ||
                '0xaE1e4c5DE66200c0dF9cdc204beBb50AA92cc930',
            CanonicalTransactionChain: process.env.CANONICAL_TRANSACTION_CHAIN_ADDRESS ||
                '0x4c15C650F75A21a4ca4052f858c867aF7Dc622eF',
            BondManager: process.env.BOND_MANAGER_ADDRESS ||
                '0xc50da178c45a2a5aC04Ccd5cdD42f07484610ecA',
            Rollup: process.env.Rollup ||
                '0x1C4b7f7B8908495d8265A2ADCF2A2C8497C2F1c9',
            OptimismPortal: process.env.OptimismPortal || "0xB3db4bd5bc225930eD674494F9A4F6a11B8EFBc8",
            L2OutputOracle: process.env.L2OutputOracle || "0x4121dc8e48Bc6196795eb4867772A5e259fecE07"
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
    [interfaces_1.L2ChainID.MANTLE_SEPOLIA_QA3]: {
        l1: {
            AddressManager: process.env.ADDRESS_MANAGER_ADDRESS ||
                '0x916fd384d84A159499926055b4986d49a09F32B8',
            L1CrossDomainMessenger: process.env.L1_CROSS_DOMAIN_MESSENGER_ADDRESS ||
                '0xE1a499d9b9A2d5c54E818F470c6b2290CE6F1e2a',
            L1StandardBridge: process.env.L1_STANDARD_BRIDGE_ADDRESS ||
                '0xEce11c400019c58F5d848E19Dcb7BE831569E50F',
            StateCommitmentChain: process.env.STATE_COMMITMENT_CHAIN_ADDRESS ||
                '0xD124e0ab525ec052E9C1662B478d8d0e39D12E56',
            CanonicalTransactionChain: process.env.CANONICAL_TRANSACTION_CHAIN_ADDRESS ||
                '0x76f65942260746C82d5800b830A51f4C173D383d',
            BondManager: process.env.BOND_MANAGER_ADDRESS ||
                '0x79405CD7e6E431bFAA3888f98380aB27bB33D2EA',
            Rollup: process.env.Rollup ||
                '0xd4D0C12C2183BcF19035eC56DA4F57367ae4A281',
            OptimismPortal: process.env.OptimismPortal || "0x8f6272D08E436521A0F6B809647EeA5712C36624",
            L2OutputOracle: process.env.L2OutputOracle || "0x29AefD059f78C39D7933fBDdDD1DfaF04448ecA8"
        },
        l2: exports.DEFAULT_L2_CONTRACT_ADDRESSES,
    },
};
exports.BRIDGE_ADAPTER_DATA = {
    [interfaces_1.L2ChainID.MANTLE]: {
        BitBTC: {
            Adapter: adapters_1.StandardBridgeAdapter,
            l1Bridge: '0xaBA2c5F108F7E820C049D5Af70B16ac266c8f128',
            l2Bridge: '0x158F513096923fF2d3aab2BcF4478536de6725e2',
        },
        DAI: {
            Adapter: adapters_1.ERC20BridgeAdapter,
            l1Bridge: '0x10E6593CDda8c58a1d0f14C5164B376352a55f2F',
            l2Bridge: '0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65',
        },
    },
    [interfaces_1.L2ChainID.MANTLE_KOVAN]: {
        wstETH: {
            Adapter: adapters_1.ERC20BridgeAdapter,
            l1Bridge: '0xa88751C0a08623E11ff38c6B70F2BbEe7865C17c',
            l2Bridge: '0xF9C842dE4381a70eB265d10CF8D43DceFF5bA935',
        },
        BitBTC: {
            Adapter: adapters_1.StandardBridgeAdapter,
            l1Bridge: '0x0b651A42F32069d62d5ECf4f2a7e5Bd3E9438746',
            l2Bridge: '0x0CFb46528a7002a7D8877a5F7a69b9AaF1A9058e',
        },
        USX: {
            Adapter: adapters_1.StandardBridgeAdapter,
            l1Bridge: '0x40E862341b2416345F02c41Ac70df08525150dC7',
            l2Bridge: '0xB4d37826b14Cd3CB7257A2A5094507d701fe715f',
        },
        DAI: {
            Adapter: adapters_1.ERC20BridgeAdapter,
            l1Bridge: '0xb415e822C4983ecD6B1c1596e8a5f976cf6CD9e3',
            l2Bridge: '0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65',
        },
    },
};
//# sourceMappingURL=chain-constants.js.map