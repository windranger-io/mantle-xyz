import React from 'react'

/**
 * Container for sections
 * Max width
 * Margins
 *Padding
 */
export const PageContainer = ({
  children,
  className,
}: {
  /**
   * What this?
   */
  children: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => <div className={`flex flex-col px-4 ${className || ``}`}>{children}</div>
