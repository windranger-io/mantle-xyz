import { CHAIN_ID } from "@config/constants";
import { contracts } from "@config/contracts";
import ContractRow from "./ContractRow";

export default function Contracts() {
  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
      <table className="min-w-full">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
            >
              Contract name
            </th>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
            >
              Address
            </th>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-3"
            >
              ABI
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(contracts[CHAIN_ID]).map(([name, contract]) => {
            return (
              <ContractRow
                key={name}
                name={name}
                address={contract.address}
                abi={JSON.stringify(contract.abi)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
