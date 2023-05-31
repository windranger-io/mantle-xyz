// import { DividerCaret } from "@mantle/ui/src/base/Icons";

export default function Divider() {
  // return <DividerCaret className="-mx-5 -my-3" />;
  return (
    <>
      <div className="shadow-[0_4px_6px_-1px_rgb(0,0,0),0_9px_9px_-2px_rgb(0,0,0)] -mx-5 -mb-2 rounded-none" />
      <div className="h-6 bg-[#0D0D0D] -mt-8 -mx-5 z-10" />
      {/* <div className="shadow-[8px_8px_16px_rgb(0,0,0)] -translate-y-4 rotate-45 w-8 h-8 bg-[#0D0D0D] -mt-6 -mb-8" /> */}
      <div
        style={{
          filter: "drop-shadow(0px 8px 8px #000)",
        }}
        className="border-t-[16px] border-r-[32px] border-l-[32px] w-[32px] border-l-transparent border-r-transparent border-t-[#0D0D0D] -mt-6"
      />
    </>
  );
}
