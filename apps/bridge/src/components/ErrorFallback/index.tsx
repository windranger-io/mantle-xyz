import clsx from 'clsx';

import AnchorLink from 'src/components/UI/BitdaoAnchorLink';

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
    <p className={clsx('text-mantleAlizarinCrimson', 'space-x-1')}>
      <span>Error: {error.message}.</span>
      <span>
        Please&nbsp;
        <AnchorLink
          onClick={resetErrorBoundary ?? handleRefresh}
          className={clsx('underline', 'cursor-pointer')}>
          refresh
        </AnchorLink>
        .
      </span>
    </p>
  );
}

export default ErrorFallback;
