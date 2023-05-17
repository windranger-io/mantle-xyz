import * as React from 'react'

export const SimpleCard = ({
  children,
  className,
}: {
  children: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => {
  const classNameHasBg = !!className?.match(/(^bg|\sbg)-/)

  return (
    <div
      className={`${
        !classNameHasBg ? `bg-white/[.06] ` : ``
      }rounded-card py-8 px-5 mx-auto ${className || ``}`}
    >
      {children}
    </div>
  )
}
