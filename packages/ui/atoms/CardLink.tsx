import * as React from 'react'

/**
 * Example of a component
 * Do use types for props
 * Do use comment to describe what the props are
 *
 */
export const CardLink = ({
  title,
  description,
  link,
}: {
  /**
   * The title of the card
   */
  title: string
  /**
   * The descrition of the card
   */
  description: string
  /**
   * The url of the card where it goes on the internet
   */
  link: string
}) => (
  <a
    href={link}
    className="mt-6 w-96 rounded-xl border p-6 text-left text-gray-50 hover:text-blue-600 focus:text-blue-600"
  >
    <h3 className="text-2xl font-bold">{title} &rarr;</h3>
    <p className="mt-4 text-xl">{description}</p>
  </a>
)
