import * as React from 'react'

export const SimpleCard = ({
  children,
  className,
}: {
  children: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => (
  <div
    className={`bg-white/[.06] rounded-card py-10 px-5 mx-auto ${
      className || ``
    }`}
  >
    {children}
  </div>
)
