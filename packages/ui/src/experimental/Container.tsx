import * as React from 'react'

export const Container = ({
  children,
  className,
}: {
  children: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => (
  <main
    className={`flex w-full flex-1 flex-col items-center justify-center px-20 text-center ${
      className || ``
    }`}
  >
    {children}
  </main>
)
