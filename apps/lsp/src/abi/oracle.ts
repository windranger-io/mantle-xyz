export const oracleABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "CannotModifyInitialRecord",
    type: "error",
  },
  {
    inputs: [],
    name: "CannotUpdateWhileUpdatePending",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidConfiguration",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRecordModification",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "end",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
    ],
    name: "InvalidUpdateEndBeforeStartBlock",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "processed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sent",
        type: "uint256",
      },
    ],
    name: "InvalidUpdateMoreDepositsProcessedThanSent",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "numValidatorsOnRecord",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "numInitiatedValidators",
        type: "uint256",
      },
    ],
    name: "InvalidUpdateMoreValidatorsThanInitiated",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "wantUpdateStartBlock",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "gotUpdateStartBlock",
        type: "uint256",
      },
    ],
    name: "InvalidUpdateStartBlock",
    type: "error",
  },
  {
    inputs: [],
    name: "NoUpdatePending",
    type: "error",
  },
  {
    inputs: [],
    name: "Paused",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "idx",
        type: "uint256",
      },
    ],
    name: "RecordDoesNotExist",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "oracleUpdater",
        type: "address",
      },
    ],
    name: "UnauthorizedOracleUpdater",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "updateFinalizingBlock",
        type: "uint256",
      },
    ],
    name: "UpdateEndBlockNumberNotFinal",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        indexed: false,
        internalType: "struct OracleRecord",
        name: "pendingUpdate",
        type: "tuple",
      },
    ],
    name: "OraclePendingUpdateRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        indexed: false,
        internalType: "struct OracleRecord",
        name: "record",
        type: "tuple",
      },
    ],
    name: "OracleRecordAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "reasonHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        indexed: false,
        internalType: "struct OracleRecord",
        name: "record",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bound",
        type: "uint256",
      },
    ],
    name: "OracleRecordFailedSanityCheck",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        indexed: false,
        internalType: "struct OracleRecord",
        name: "record",
        type: "tuple",
      },
    ],
    name: "OracleRecordModified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes4",
        name: "setterSelector",
        type: "bytes4",
      },
      {
        indexed: false,
        internalType: "string",
        name: "setterSignature",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
    ],
    name: "ProtocolConfigChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ORACLE_MANAGER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ORACLE_MODIFIER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ORACLE_PENDING_UPDATE_RESOLVER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "acceptPendingUpdate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "aggregator",
    outputs: [
      {
        internalType: "contract IReturnsAggregatorWrite",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "finalizationBlockNumberDelta",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "hasPendingUpdate",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "admin",
            type: "address",
          },
          {
            internalType: "address",
            name: "manager",
            type: "address",
          },
          {
            internalType: "address",
            name: "oracleUpdater",
            type: "address",
          },
          {
            internalType: "address",
            name: "pendingResolver",
            type: "address",
          },
          {
            internalType: "contract IReturnsAggregatorWrite",
            name: "aggregator",
            type: "address",
          },
          {
            internalType: "contract IPauser",
            name: "pauser",
            type: "address",
          },
          {
            internalType: "contract IStakingInitiationRead",
            name: "staking",
            type: "address",
          },
        ],
        internalType: "struct Oracle.Init",
        name: "init",
        type: "tuple",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRecord",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxConsensusLayerGainPerBlockPPT",
    outputs: [
      {
        internalType: "uint40",
        name: "",
        type: "uint40",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxConsensusLayerLossPPM",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxDepositPerValidator",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minConsensusLayerGainPerBlockPPT",
    outputs: [
      {
        internalType: "uint40",
        name: "",
        type: "uint40",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minDepositPerValidator",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minReportSizeBlocks",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "idx",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "record",
        type: "tuple",
      },
    ],
    name: "modifyExistingRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "numRecords",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracleUpdater",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pauser",
    outputs: [
      {
        internalType: "contract IPauser",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingUpdate",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "newRecord",
        type: "tuple",
      },
    ],
    name: "receiveRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "idx",
        type: "uint256",
      },
    ],
    name: "recordAt",
    outputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rejectPendingUpdate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "prevRecord",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "newRecord",
        type: "tuple",
      },
    ],
    name: "sanityCheckUpdate",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "finalizationBlockNumberDelta_",
        type: "uint256",
      },
    ],
    name: "setFinalizationBlockNumberDelta",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint40",
        name: "maxConsensusLayerGainPerBlockPPT_",
        type: "uint40",
      },
    ],
    name: "setMaxConsensusLayerGainPerBlockPPT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint24",
        name: "maxConsensusLayerLossPPM_",
        type: "uint24",
      },
    ],
    name: "setMaxConsensusLayerLossPPM",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxDepositPerValidator_",
        type: "uint256",
      },
    ],
    name: "setMaxDepositPerValidator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint40",
        name: "minConsensusLayerGainPerBlockPPT_",
        type: "uint40",
      },
    ],
    name: "setMinConsensusLayerGainPerBlockPPT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minDepositPerValidator_",
        type: "uint256",
      },
    ],
    name: "setMinDepositPerValidator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "minReportSizeBlocks_",
        type: "uint16",
      },
    ],
    name: "setMinReportSizeBlocks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newUpdater",
        type: "address",
      },
    ],
    name: "setOracleUpdater",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "staking",
    outputs: [
      {
        internalType: "contract IStakingInitiationRead",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prevRecordIndex",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint64",
            name: "updateStartBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "updateEndBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "currentNumValidatorsNotWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "cumulativeNumValidatorsWithdrawable",
            type: "uint64",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnPrincipalAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "windowWithdrawnRewardAmount",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentTotalValidatorBalance",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "cumulativeProcessedDepositAmount",
            type: "uint128",
          },
        ],
        internalType: "struct OracleRecord",
        name: "newRecord",
        type: "tuple",
      },
    ],
    name: "validateUpdate",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
] as const;
