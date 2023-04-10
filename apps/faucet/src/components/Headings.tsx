export function Heading({
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

export function Description({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-type-secondary text-center text-sm mb-4">{children}</p>
  );
}
