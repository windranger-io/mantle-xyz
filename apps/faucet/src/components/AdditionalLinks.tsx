import { MantleLink, Typography } from "@mantle/ui";

export function AdditionalLinks() {
  return (
    <div className="flex flex-col items-center gap-4 pb-10">
      <Typography>Need to bridge assets to Mantle Sepolia?</Typography>
      <div className="flex flex-col gap-2">
        <MantleLink
          variant="additionalLinks"
          rel="noreferrer noopener"
          target="_blank"
          href="https://app.mantle.xyz/bridge?network=sepolia"
        >
          Mantle Sepolia Bridge
        </MantleLink>

        <MantleLink
          variant="additionalLinks"
          rel="noreferrer noopener"
          target="_blank"
          href="https://sepolia.mantlescan.xyz/"
        >
          Mantle Sepolia Explorer
        </MantleLink>
      </div>
    </div>
  );
}
