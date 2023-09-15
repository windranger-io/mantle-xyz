import TxLink from "@components/converter/utils/TxLink";
import { L1_BITDAO_TOKEN, L1_CHAIN_ID } from "@config/constants";
import { formatUnits } from "ethers/lib/utils";

import { BigNumberish } from "ethers";

export default function TxRow({
  approvalTxHash,
  migrationTxHash = undefined,
  blockTimestamp,
  amount,
  status,
}: {
  approvalTxHash: string;
  migrationTxHash: string | undefined;
  blockTimestamp: BigNumberish;
  amount: BigNumberish;
  status: string;
}) {
  return (
    <tr className="border-b-[1px] border-stroke-secondary">
      <td className="py-4 table-row md:table-cell">
        <div className="pt-4 py-2 md:pt-2">
          {new Date((blockTimestamp as number) * 1000).toUTCString()}
        </div>
      </td>
      <td className="table-row md:table-cell">
        <div className="py-2">
          <TxLink
            chainId={L1_CHAIN_ID}
            txHash={approvalTxHash}
            className=""
            asHash
          />
        </div>
      </td>
      <td className="table-row md:table-cell">
        <div className="py-2">
          {migrationTxHash ? (
            <TxLink
              chainId={L1_CHAIN_ID}
              txHash={migrationTxHash as string}
              className=""
              asHash
            />
          ) : (
            "awaiting"
          )}
        </div>
      </td>
      <td className="table-row md:table-cell">
        <div className="py-2">
          {formatUnits(amount || 0, L1_BITDAO_TOKEN?.decimals).toString()}{" "}
          {L1_BITDAO_TOKEN?.symbol}
        </div>
      </td>

      <td className="table-row md:table-cell">
        <div className="flex pb-4 py-2 flex-row gap-2 items-center md:pb-2">
          <div className="flex flex-row gap-2 items-center">
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="5.5"
                cy="5.50098"
                r="5.5"
                fill={status === "PENDING" ? "#F26A1D" : "#62b471"}
              />
            </svg>

            {status === "PENDING" ? (
              <span className="flex flex-row space-x-2 items-center gap-1">
                Pending
              </span>
            ) : (
              <span>Completed</span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
