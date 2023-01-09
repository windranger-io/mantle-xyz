import React from 'react'

/**
 * Example of a component
 * Do use types for props
 * Do use comment to describe what the props are
 *
 */
export const Text = ({
  children,
  className,
  tag,
}: {
  /**
   * What this?
   */
  children: React.ReactNode
  className: string
  tag: JSX.Element
}) => {
  const classes = `${className}`
  const TagName = tag

  return <TagName className={classes}>{children}</TagName>
}
