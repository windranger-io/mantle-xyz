import clsx from "clsx";

interface Props {
  error: Error;
  // eslint-disable-next-line react/require-default-props
  resetErrorBoundary?: () => void;
}

const handleRefresh = () => {
  window.location.reload();
};

function ErrorFallback({ error, resetErrorBoundary }: Props): JSX.Element {
  return (
    <p className={clsx("text-mantleAlizarinCrimson", "space-x-1")}>
      <span>Error: {error.message}.</span>
      <span>
        Please&nbsp;
        <button
          type="button"
          onClick={resetErrorBoundary ?? handleRefresh}
          className={clsx("underline", "cursor-pointer")}
        >
          refresh
        </button>
        .
      </span>
    </p>
  );
}

export default ErrorFallback;
