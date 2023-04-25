import { MantleLink, Typography } from "@mantle/ui";

export function AdditionalLinks() {
  return (
    <div className="flex flex-col items-center gap-4 pb-10">
      <Typography>
        Don’t have enough gas to mint tokens? Get some goerli ETH here:
      </Typography>
      <div className="flex flex-col gap-2">
        <MantleLink
          variant="additionalLinks"
          target="blank"
          href="https://faucet.paradigm.xyz/"
        >
          Paradigm gETH Faucet
        </MantleLink>
        <MantleLink
          variant="additionalLinks"
          target="blank"
          href="https://goerlifaucet.com/"
        >
          Alchemy gETH Faucet
        </MantleLink>
      </div>
    </div>
  );
}
