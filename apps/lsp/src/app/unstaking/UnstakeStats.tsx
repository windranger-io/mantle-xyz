import { T } from "@mantle/ui";

export default function UnstakeStats() {
  return (
    <div className="max-w-[484px] w-full grid relative px-5 py-4 bg-black overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-[20px] mx-auto">
      <div className="grid grid-cols-2">
        <div className="flex flex-col space-y-2">
          <T>Pending</T>
          <T>0 ETH</T>
        </div>
        <div className="flex flex-col space-y-2">
          <T>Ready to claim</T>
          <T>0 ETH</T>
        </div>
      </div>
    </div>
  );
}
