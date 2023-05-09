export function CardHeading({
  numDisplay,
  header,
}: {
  numDisplay: string;
  header: string;
}) {
  return (
    <div className="relative mb-2">
      <div className="bg-displayNumbers/[0.05] inline-block rounded-full leading-0 px-3 pt-0.5 absolute">
        {numDisplay}
      </div>
      <div className="text-lg text-center w-full">{header}</div>
    </div>
  );
}
