import React from 'react'

/**
 * Example of a component
 * Do use types for props
 * Do use comment to describe what the props are
 *
 */
export const PageWrapper = ({
  children,
}: {
  /**
   * What this?
   */
  children: React.ReactNode
}) => <div className="flex flex-col px-4 lg:px-8">{children}</div>
