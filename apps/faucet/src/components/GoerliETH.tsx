import { Links } from "@mantle/ui";

export function GoerliETH() {
  return (
    <div className="flex flex-col items-center gap-4 pb-10">
      <p>Don’t have enough gas to mint tokens? Get some goerli ETH here:</p>
      <div className="flex flex-col gap-2">
        <Links
          className="underline text-[#0A8FF6] hover:text-button-primary transition ease-in-out duration-300 cursor-pointer"
          target="blank"
          href="https://faucet.paradigm.xyz/"
        >
          Paradigm gETH Faucet
        </Links>
        <Links
          className="underline text-[#0A8FF6] hover:text-button-primary transition ease-in-out duration-300 cursor-pointer"
          target="blank"
          href="https://goerlifaucet.com/"
        >
          Alchemy gETH Faucet
        </Links>
      </div>
    </div>
  );
}
