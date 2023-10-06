import Image from "next/image";
import { NodeOperator, beaconchainValidatorLink } from "@util/util";
import { ValidatorDeposit } from "../hooks/useRecentValidators";

const nodeOpToImage: Record<NodeOperator, string> = {
  [NodeOperator.Blockdaemon]: "/bd.jpeg",
  [NodeOperator.P2P]: "/p2p.jpeg",
};

export default function ValidatorCard({
  validator,
}: {
  validator: ValidatorDeposit;
}) {
  return (
    <div className="max-w-fit overflow-hidden rounded-xl border border-gray-200">
      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
        <Image
          src={nodeOpToImage[validator.nodeOperatorId as NodeOperator]}
          width={40}
          height={40}
          alt="blockdaemon"
        />
        <div className="text-sm font-medium leading-6 text-gray-900">
          <a href={beaconchainValidatorLink(validator.id)}>
            {validator.id.slice(0, 10)}
          </a>
        </div>
      </div>
      <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Deposited at</dt>
          <dd className="text-gray-700">
            <div>{validator.depositedAt.toLocaleString()}</div>
          </dd>
        </div>
      </dl>
    </div>
  );
}
