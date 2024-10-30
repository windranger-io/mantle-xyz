// A row of values used in the deposit/withdraw CTA modal
export default function Values({
  label,
  value,
  border = false,
}: {
  label?: string;
  value: string | JSX.Element;
  border: boolean;
}) {
  return (
    <div className="flex flex-col my-5">
      {label && <div className="text-type-secondary">{label}</div>}
      <div className="text-xl mb-5 text-white">{value}</div>
      {border && (
        <div className="w-full" style={{ borderBottom: "1px solid #41474D" }} />
      )}
    </div>
  );
}

Values.defaultProps = {
  label: undefined,
};
