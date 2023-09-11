import { Mode } from "./StakeToggle";
import EthToken from "./Tokens/Eth";
import MEthToken from "./Tokens/Meth";

export default function TokenDirection({ mode }: { mode: Mode }) {
  return (
    <div className="flex flex-row w-full justify-between items-center pb-4 px-5">
      <div className="flex flex-row items-center gap-3">
        {mode === Mode.STAKE ? <EthToken /> : <MEthToken />}
        <div className="flex flex-col">
          <div>From</div>
          <div>{mode === Mode.STAKE ? "ETH" : "mETH"}</div>
        </div>
      </div>
      <div className="">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.34903 6.40001L11.3494 6.40001L6.14983 1.20041L6.99943 0.349609L13.6738 7.00001L6.99943 13.6744L6.14983 12.7996L11.3494 7.60001L0.34903 7.60001L0.34903 6.40001Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-col text-right">
            <div>To</div>
            <div>{mode === Mode.UNSTAKE ? "ETH" : "mETH"}</div>
          </div>
        </div>
        <div>{mode === Mode.UNSTAKE ? <EthToken /> : <MEthToken />}</div>
      </div>
    </div>
  );
}
