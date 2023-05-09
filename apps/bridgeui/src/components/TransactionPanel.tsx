import { Typography } from "@mantle/ui";

/**
 *
 * @todo Make dynamic based on data
 *
 */

export default function TransactionPanel() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Typography variant="smallWidget">Time to transfer</Typography>
        <Typography variant="smallWidget" className="text-white">
          ~ 20 min
        </Typography>
      </div>
      <div className="flex justify-between">
        <Typography variant="smallWidget">Gas fee</Typography>
        <Typography variant="smallWidget" className="text-white">
          27 Gwei
        </Typography>
      </div>
      <div className="flex justify-between">
        <Typography variant="smallWidget">You will receive</Typography>
        <Typography variant="smallWidget" className="text-white">
          0.25 ETH
        </Typography>
      </div>
    </div>
  );
}
