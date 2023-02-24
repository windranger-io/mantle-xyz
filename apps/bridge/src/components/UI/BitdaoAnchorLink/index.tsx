import * as React from 'react';
import clsx from 'clsx';

const BitdaoAnchorLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({
    // eslint-disable-next-line react/prop-types
    className,
    children,
    ...rest
  }, ref): JSX.Element => (
    <a
      ref={ref}
      className={clsx(
        'px-1',
        'py-0.5',
        'hover:bg-mantleBlack/5',
        className
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}>
      {children}
    </a>
  )
);
BitdaoAnchorLink.displayName = 'BitdaoAnchorLink';

export type Props = React.ComponentPropsWithRef<'a'>;

export default BitdaoAnchorLink;
