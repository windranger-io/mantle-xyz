import { Typography } from "@mantle/ui";

export default function DirectionLabel({
  direction,
  logo,
  chain,
}: {
  direction: string;
  logo: React.ReactNode;
  chain: string;
}) {
  return (
    <div className="flex space-x-2.5 pb-4 items-center">
      <Typography variant="body">{direction}:</Typography>
      <div className="flex space-x-2">
        {logo}
        <Typography variant="body"> {chain}</Typography>
      </div>
    </div>
  );
}
