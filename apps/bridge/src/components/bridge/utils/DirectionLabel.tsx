import { Typography } from "@mantle/ui";

export default function DirectionLabel({
  direction,
  logo,
  chain,
  className = "",
}: {
  direction: string;
  logo: React.ReactNode;
  chain: string;
  // eslint-disable-next-line react/require-default-props
  className?: string;
}) {
  return (
    <div
      className={`flex pb-4 items-center${className ? ` ${className}` : ""}`}
    >
      <Typography variant="body">
        {direction}
        {direction && ":"}
      </Typography>
      <div className="flex ml-1 space-x-2 items-center">
        {logo}
        <Typography variant="body"> {chain}</Typography>
      </div>
    </div>
  );
}
