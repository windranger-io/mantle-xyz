import { Fragment } from "react";
import { cn } from "@mantle/ui/src/utils";
import { formatEther } from "ethers/lib/utils";
import { OracleRecord } from "../hooks/useOracleRecords";
import { PendingOracleRecord } from "../hooks/usePendingRecords";

type TableData = {
  name: string;
  records: OracleRecord[] | PendingOracleRecord[];
};

function Delta({
  prev,
  curr,
  formatter = (x) => x.toString(),
}: {
  prev?: bigint | number;
  curr: bigint | number;
  formatter?: (x: bigint) => string;
}) {
  if (prev === undefined) {
    return null;
  }
  const delta = BigInt(curr) - BigInt(prev);
  return (
    <>
      {delta > 0 && (
        <span className="text-green-600 font-semibold">{` (+${formatter(
          delta
        )})`}</span>
      )}
      {delta < 0 && (
        <span className="text-red-600 font-semibold">{` (${formatter(
          delta
        )})`}</span>
      )}
    </>
  );
}

export default function RecordsTable({
  pendingRecord,
  records,
}: {
  pendingRecord?: PendingOracleRecord;
  records: OracleRecord[];
}) {
  const data: TableData[] = [
    {
      name: "Records",
      records,
    },
  ];
  if (pendingRecord) {
    data.unshift({
      name: "Pending record",
      records: [pendingRecord],
    });
  }

  return (
    <div className="px-2">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Record index
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Block range
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Number of active validators
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Current total validator balance
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Principals withdrawn (this record)
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Rewards withdrawn (this record)
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Total processed deposits
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Total validators withdrawable
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
                  >
                    Was modified?
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100"
                  >
                    Record received at
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((section) => (
                  <Fragment key={section.name}>
                    <tr className="border-t border-gray-600">
                      <th
                        colSpan={10}
                        scope="colgroup"
                        className="bg-black/5 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-3"
                      >
                        {section.name}
                      </th>
                    </tr>
                    {section.records.map((record, recordIndex) => {
                      let prevRecord = null;
                      const lastIndex = section.records.length - 1;
                      if (recordIndex < lastIndex) {
                        prevRecord = section.records[recordIndex + 1];
                      }

                      return (
                        <tr
                          key={record.id}
                          className={cn(
                            "border-t",
                            recordIndex === 0
                              ? "border-gray-900"
                              : "border-gray-800",
                            section.name === "Pending record"
                              ? "bg-yellow-50"
                              : ""
                          )}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-200 sm:pl-3">
                            {record.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            <a
                              className="hover:font-semibold"
                              href={`https://goerli.beaconcha.in/block/${record.updateStartBlock}`}
                            >
                              {record.updateStartBlock}
                            </a>
                            {" -> "}
                            <a
                              className="hover:font-semibold"
                              href={`https://goerli.beaconcha.in/block/${record.updateEndBlock}`}
                            >
                              {record.updateEndBlock}
                            </a>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {record.currentNumValidatorsNotWithdrawable}{" "}
                            <Delta
                              prev={
                                prevRecord?.currentNumValidatorsNotWithdrawable
                              }
                              curr={record.currentNumValidatorsNotWithdrawable}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {formatEther(record.currentTotalValidatorBalance)}
                            <Delta
                              prev={prevRecord?.currentTotalValidatorBalance}
                              curr={record.currentTotalValidatorBalance}
                              formatter={formatEther}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {formatEther(record.windowWithdrawnPrincipalAmount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {formatEther(record.windowWithdrawnRewardAmount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {formatEther(
                              record.cumulativeProcessedDepositAmount
                            )}
                            <Delta
                              prev={
                                prevRecord?.cumulativeProcessedDepositAmount
                              }
                              curr={record.cumulativeProcessedDepositAmount}
                              formatter={formatEther}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {record.cumulativeNumValidatorsWithdrawable}
                            <Delta
                              prev={
                                prevRecord?.cumulativeNumValidatorsWithdrawable
                              }
                              curr={record.cumulativeNumValidatorsWithdrawable}
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {record.wasModified ? "Yes" : "No"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-100">
                            {new Date(
                              record.receivedAt * 1000
                            ).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
