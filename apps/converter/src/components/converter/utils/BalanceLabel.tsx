import { Typography } from "@mantle/ui";

export default function BalanceLabel({
  label,
  logo,
  balance,
  className = "",
}: {
  label: string;
  logo: React.ReactNode;
  balance: string;
  // eslint-disable-next-line react/require-default-props
  className?: string;
}) {
  return (
    <div
      className={`flex space-x-1 items-center${
        className ? ` ${className}` : ""
      }`}
    >
      <Typography variant="body">{label}:</Typography>
      <div className="flex space-x-1 items-center">
        {logo}
        <Typography variant="body"> {balance}</Typography>
      </div>
    </div>
  );
}
