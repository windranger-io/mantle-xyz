import { MantleLink, Typography } from "@mantle/ui";

export function AdditionalLinks() {
  return (
    <div className="flex flex-col items-center gap-4 pb-10">
      <Typography>
        Don’t have enough gas to mint tokens? Get some sepolia ETH here:
      </Typography>
      <div className="flex flex-col gap-2">
        <MantleLink
          variant="additionalLinks"
          rel="noreferrer noopener"
          target="_blank"
          href="https://www.infura.io/faucet/sepolia"
        >
          Infura sepoliaETH Faucet
        </MantleLink>

        <MantleLink
          variant="additionalLinks"
          rel="noreferrer noopener"
          target="_blank"
          href="https://sepoliafaucet.com/"
        >
          Alchemy sepoliaETH Faucet
        </MantleLink>
      </div>
    </div>
  );
}
