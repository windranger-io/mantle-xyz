import React from 'react'

/**
 * Example of a component
 * Do use types for props
 * Do use comment to describe what the props are
 *
 */
export const PageWrapper = ({
  children,
  className,
}: {
  /**
   * What this?
   */
  children: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => <main className={`flex flex-col ${className || ``}`}>{children}</main>
