/* eslint-disable react/require-default-props */
import React from 'react'

/**
 * Page wrapper
 * Do use types for props
 * Do use comment to describe what the props are
 *
 */
export const PageWrapper = ({
  children,
  className,
  siteBackroundImage,
  header,
}: {
  /**
   * What this?
   */
  children: React.ReactNode
  siteBackroundImage?: React.ReactNode
  header: React.ReactNode
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => (
  <main className={`flex flex-col ${className || ``}`}>
    {siteBackroundImage}
    {header}
    {children}
  </main>
)
