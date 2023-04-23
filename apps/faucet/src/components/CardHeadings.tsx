export function CardHeading({
  numDisplay,
  header,
}: {
  numDisplay: string;
  header: string;
}) {
  return (
    <div className="flex mb-2">
      <div className="bg-displayNumbers/[0.05] inline-block rounded-full leading-0 px-3 pt-0.5">
        {numDisplay}
      </div>
      <h2 className="text-lg text-center w-full">{header}</h2>
    </div>
  );
}
