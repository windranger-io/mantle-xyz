import React from 'react'

/**
 * Example of a component
 * Do use types for props
 * Do use comment to describe what the props are
 *
 */
export const Page = ({
  children,
}: {
  /**
   * What this?
   */
  children: React.ReactNode
}) => (
  <div className="flex min-h-screen flex-col items-center justify-center py-2">
    {children}
  </div>
)
