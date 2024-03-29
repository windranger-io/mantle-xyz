import { ConvertCard } from "@components/ConvertCard";
import { Typography } from "@mantle/ui";
import { cn } from "@mantle/ui/src/utils";

type SCTrackerProps = {
  halted: boolean;
};

export function SmartContractTracker({ halted }: SCTrackerProps) {
  // const { balance } = useAccountBalance(
  //   L1_CONVERTER_V2_CONTRACT_ADDRESS,
  //   L1_MANTLE_TOKEN_ADDRESS
  // );

  // to avoid hydration error
  // const [balanceDataClient, setBalanceDataClient] = useState<string>("");
  // useEffect(() => {
  //   setBalanceDataClient(balance?.toString() || "");
  // }, [balance]);

  // const formattedBalance = useMemo(() => {
  //   const formatted = formatUnits(
  //     balanceDataClient || "0",
  //     L1_MANTLE_TOKEN.decimals
  //   );
  //   const formattedMoney = new Intl.NumberFormat("us-US", {}).format(
  //     +formatted
  //   );

  //   return formattedMoney;
  // }, [balanceDataClient]);

  return (
    <ConvertCard className="rounded-xl w-full">
      <div className="flex px-2 py-2 gap-3">
        <div
          className={cn("h-3 w-3 rounded-full bg-green-400 mt-[3px]", {
            "bg-red-500": halted,
          })}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Typography className="text-type-secondary">Status</Typography>
            <Typography className="font-bold text-type-primary">
              {halted ? "Not " : ""}Available ({!halted ? "Unh" : "H"}alted)
            </Typography>
          </div>
          {/* <div className="flex flex-col">
            <Typography className="text-type-secondary">
              Tokens left to migrate
            </Typography>
            <Typography className="font-bold text-type-primary">
              {formattedBalance} MNT
            </Typography>
          </div> */}
        </div>
      </div>
    </ConvertCard>
  );
}
