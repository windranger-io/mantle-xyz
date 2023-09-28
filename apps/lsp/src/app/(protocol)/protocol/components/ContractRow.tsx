import { Button } from "@mantle/ui";
import { useState } from "react";

export default function ContractRow({
  name,
  address,
  abi,
}: {
  name: string;
  address: string;
  abi: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  return (
    <tr key={name}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
        {name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
        {address}{" "}
        <Button
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(address);
            setAddressCopied(true);
          }}
        >
          Copy {addressCopied && "✓"}
        </Button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
        <Button
          onClick={() => {
            navigator.clipboard.writeText(abi);
            setIsCopied(true);
          }}
        >
          Copy ABI {isCopied && "✓"}
        </Button>
      </td>
    </tr>
  );
}
