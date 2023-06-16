/* eslint-disable react/button-has-type */

'use client'

/* eslint-disable react/require-default-props */

import { useRef, useState } from 'react'
import { usePathname } from 'next-intl/client'

import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { Button } from './Button'

import { useOnClickOutside } from './useOnClickOutside'
import { IconCaretDown } from '../base/Icons'

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
    <div className="flex flex-col relative " ref={dropdownRef}>
      {open && (
        <div className="absolute top-10 w-16  backdrop-blur ">
          <div className="">
            {locales &&
              locales.map(
                l =>
                  l !== locale && (
                    <div className="hover:bg-[rgba(0,0,0,0.3)] border-b border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] last:border-b-0 first:rounded-t-lg last:rounded-b-lg transition duration-150 ">
                      <Button
                        onClick={handleChangeLocale(`/${l}${pathname}`)}
                        key={l}
                        disabled={l === locale || !open}
                        className="rounded-none w-full border-0 "
                      >
                        <span className="">{l.toUpperCase()}</span>
                        <IconCaretDown className="opacity-0" />
                      </Button>
                    </div>
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
        <IconCaretDown
          className={classNames('w-3 h-3', { 'rotate-180': open })}
        />
      </Button>
    </div>
  )
}
