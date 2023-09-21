import { CHAIN_ID } from "@config/constants";
import { ContractName, contracts } from "@config/contracts";
import { formatEther } from "ethers/lib/utils";
import { useAccount, useBlockNumber, useContractReads } from "wagmi";

function StakingStats() {
  const { address } = useAccount();

  const stakingContract = contracts[CHAIN_ID][ContractName.Staking];
  const funcsToRead = [
    { name: "totalControlled", transform: formatEther },
    { name: "unallocatedETH", transform: formatEther },
    { name: "allocatedETHForDeposits", transform: formatEther },
    { name: "numInitiatedValidators", transform: (x: any) => x.toString() },
    { name: "totalDepositedInValidators", transform: formatEther },
  ];

  const dataRead = useContractReads({
    enabled: Boolean(address),
    watch: true,
    contracts: [
      ...funcsToRead.map((fn) => {
        return {
          ...stakingContract,
          functionName: fn.name,
        };
      }),
    ],
    select: (data) => {
      return data.map((d, i) => {
        const fn = funcsToRead[i];
        return fn.transform(d.result as bigint);
      });
    },
  });

  return (
    <div className="flex flex-col">
      {dataRead.data &&
        dataRead.data.map((d, i) => {
          const fn = funcsToRead[i];
          return (
            <div
              key={fn.name}
              className="flex flex-row justify-between mb-1 border-b-2"
            >
              <span>{fn.name}:</span>
              <span>{d}</span>
            </div>
          );
        })}
    </div>
  );
}

type OracleRecord = {
  updateStartBlock: bigint;
  updateEndBlock: bigint;
  currentNumValidatorsWithBalance: bigint;
  cumulativeNumValidatorsFullyWithdrawn: bigint;
  windowWithdrawnPrincipalAmount: bigint;
  windowWithdrawnRewardAmount: bigint;
  currentTotalValidatorBalance: bigint;
  cumulativeProcessedDepositAmount: bigint;
};

function DebugOracleRecord({
  oracleRecord,
  currentBlock,
}: {
  oracleRecord: OracleRecord;
  currentBlock?: bigint;
}) {
  let window = `${oracleRecord.updateStartBlock.toString()} -> ${oracleRecord.updateEndBlock.toString()}`;
  if (currentBlock) {
    window += ` (${(
      currentBlock - oracleRecord.updateEndBlock
    ).toString()} behind)`;
  }

  const numValidators = `Vals: ${oracleRecord.currentNumValidatorsWithBalance.toString()} / Withdrawn: ${oracleRecord.cumulativeNumValidatorsFullyWithdrawn.toString()}`;
  const withdrawn = `Withdrawn Principals: ${formatEther(
    oracleRecord.windowWithdrawnPrincipalAmount
  )} / Withdrawn Rewards: ${formatEther(
    oracleRecord.windowWithdrawnRewardAmount
  )}`;
  const consensus = `Consensus bal: ${formatEther(
    oracleRecord.currentTotalValidatorBalance
  )}`;
  const processed = `Total processed: ${formatEther(
    oracleRecord.cumulativeProcessedDepositAmount
  )}`;
  return (
    <div className="flex flex-col text-sm text-right">
      <p>{window}</p>
      <p>{numValidators}</p>
      <p>{withdrawn}</p>
      <p>{consensus}</p>
      <p>{processed}</p>
    </div>
  );
}

function OracleStats() {
  const { address } = useAccount();
  const currBlock = useBlockNumber({ enabled: Boolean(address), watch: true });

  const oracleContract = contracts[CHAIN_ID][ContractName.Oracle];
  const funcsToRead = [
    {
      name: "hasPendingUpdate",
      contract: oracleContract,
      transform: (x: boolean) => x.toString(),
    },
    {
      name: "numRecords",
      contract: oracleContract,
      transform: (x: any) => x.toString(),
    },
    {
      name: "latestRecord",
      contract: oracleContract,
      // eslint-disable-next-line react/no-unstable-nested-components
      transform: (x: OracleRecord) => {
        return (
          <DebugOracleRecord
            key={x.updateEndBlock.toString()}
            currentBlock={currBlock.data}
            oracleRecord={x}
          />
        );
      },
    },
  ];

  const dataRead = useContractReads({
    enabled: Boolean(address),
    watch: true,
    contracts: [
      ...funcsToRead.map((fn) => {
        return {
          ...fn.contract,
          functionName: fn.name,
        };
      }),
    ],
    select: (data) => {
      return data.map((d, i) => {
        const fn = funcsToRead[i];
        return fn.transform(d.result as any);
      });
    },
  });

  return (
    <div className="flex flex-col">
      {dataRead.data &&
        dataRead.data.map((d, i) => {
          const fn = funcsToRead[i];
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={fn.name + i}
              className="flex flex-row justify-between mb-1 border-b-2"
            >
              <span>{fn.name}:</span>
              <span>{d}</span>
            </div>
          );
        })}
    </div>
  );
}

function PauserState() {
  const { address } = useAccount();

  const pauserContract = contracts[CHAIN_ID][ContractName.Pauser];
  const boolTrans = (x: boolean) => x.toString();

  const funcsToRead = [
    { name: "isStakingPaused", transform: boolTrans },
    { name: "isUnstakeRequestsAndClaimsPaused", transform: boolTrans },
    { name: "isInitiateValidatorsPaused", transform: boolTrans },
    { name: "isSubmitOracleRecordsPaused", transform: boolTrans },
    { name: "isAllocateETHPaused", transform: boolTrans },
  ];

  const dataRead = useContractReads({
    enabled: Boolean(address),
    watch: true,
    contracts: [
      ...funcsToRead.map((fn) => {
        return {
          ...pauserContract,
          functionName: fn.name,
        };
      }),
    ],
    select: (data) => {
      return data.map((d, i) => {
        const fn = funcsToRead[i];
        return fn.transform(d.result as boolean);
      });
    },
  });

  return (
    <div className="flex flex-col">
      {dataRead.data &&
        dataRead.data.map((d, i) => {
          const fn = funcsToRead[i];
          return (
            <div
              key={fn.name}
              className="flex flex-row justify-between mb-1 border-b-2"
            >
              <span>{fn.name}:</span>
              <span>{d}</span>
            </div>
          );
        })}
    </div>
  );
}

export default function Overview() {
  return (
    <div className="flex flex-col rounded-lg p-4">
      <h1 className="mb-4">Protocol data </h1>
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Staking</h2>
        <StakingStats />
      </div>
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Oracle</h2>
        <OracleStats />
      </div>
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Pause state</h2>
        <PauserState />
      </div>
    </div>
  );
}
