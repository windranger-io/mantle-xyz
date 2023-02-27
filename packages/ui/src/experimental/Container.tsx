import * as React from 'react'

/**
 * Example of a component
 * Do use types for props
 * Do use comment to describe what the props are
 *
 */
export const Container = ({
  children,
  className,
}: {
  children: React.ReactNode
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

Container.defaultProps = {
  className: null,
}
