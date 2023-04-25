import clsx from 'clsx'

type Props = React.ComponentPropsWithRef<'button'>

function BasicButton({
  className,
  ...rest
}: // eslint-disable-next-line arrow-body-style
Props) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button
      className={clsx(
        'border',
        'border-white',
        'p-3',
        'rounded-md',
        'disabled:border-gray-400',
        'disabled:text-gray-400',
        'w-auto',
        className,
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  )
}

export type { Props }

export default BasicButton
