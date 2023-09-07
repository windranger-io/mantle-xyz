import { Typography } from "@mantle/ui";
import StateContext from "@providers/stateContext";
import { useContext } from "react";

export function TransactionSummary() {
  const { allowance } = useContext(StateContext);

  return (
    <div className="space-y-3 pt-6" key="tx-panel-0">
      <div className="flex justify-between">
        <Typography variant="smallWidget">Pending amount approved</Typography>
        <Typography variant="smallWidget" className="text-white">
          {parseFloat(allowance || "0")} BIT
        </Typography>
      </div>
      <div className="flex justify-between">
        <Typography variant="smallWidget">Migration rate</Typography>
        <Typography variant="smallWidget" className="text-white">
          1 BIT = 1 MNT
        </Typography>
      </div>

      {/* <div className="flex justify-between">
        <Typography variant="smallWidget">Approx. time to migrate</Typography>
        <Typography variant="smallWidget" className="text-white">
          ~ 5 min
        </Typography>
      </div> */}
    </div>
  );
}
