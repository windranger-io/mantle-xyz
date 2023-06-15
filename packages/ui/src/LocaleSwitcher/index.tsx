/* eslint-disable react/button-has-type */

'use client'

/* eslint-disable react/require-default-props */

import { useRef, useState } from 'react'
import { usePathname } from 'next-intl/client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { Button } from './Button'

import { useOnClickOutside } from './useOnClickOutside'

export const LocaleSwitcher = ({
  locales,
  locale,
}: {
  locales: string[]
  locale: string
}) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleClickOutside = () => {
    if (open) {
      setOpen(false)
    }
  }

  const handleChangeLocale = (path: string) => () => router.push(path)

  useOnClickOutside(dropdownRef, handleClickOutside)

  return (
    <div className="" ref={dropdownRef}>
      {open && (
        <div className="">
          <div className="bg-ds-bg-card">
            {locales &&
              locales.map(
                l =>
                  l !== locale && (
                    <Button
                      onClick={handleChangeLocale(`/${l}${pathname}`)}
                      key={l}
                      disabled={l === locale || !open}
                      className="rounded-none w-full border-0"
                    >
                      <span className="ml-3">{l.toUpperCase()}</span>
                      {/* down carret */}
                    </Button>
                  ),
              )}
          </div>
        </div>
      )}
      <Button
        className={classNames('w-16', {
          'md:rounded-t-none md:border-t-transparent ': open,
        })}
        onClick={() => setOpen(!open)}
      >
        {locale.toUpperCase()}
        {/* carret down */}
        {/* <IconCaretDown
          className={classNames('w-3 h-3', { 'rotate-180': open })}
        /> */}
      </Button>
    </div>
  )
}
