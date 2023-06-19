import { ReactElement } from 'react'
import { useTranslations } from 'next-intl'

type Props = {
  children: (items: { [key: string]: string }) => ReactElement
  namespace: string
  keys: { [key: string]: string }
}

/**
 * ServerTranslate a function as a child and does the translations serverside before passing the results as props to your client component
 *
 * Example
 * ```
 * <ServerTranslate
 *   namespace="Index"
 *   keys={{ title: 'title', description: 'description' }}
 * >
 *   {translated => (
 *     <ClientComponent
 *      title={translated.title}
 *      description={translated.description}
 *   />
 *   )}
 * </ServerTranslate>
 * ```
 */
export const ServerTranslate = ({ namespace, keys, children }: Props) => {
  const t = useTranslations(namespace)
  const translated = Object.assign(keys, {})

  Object.entries(keys).forEach(([key, value]) => {
    translated[key] = t(value)
  })

  return children(translated)
}
