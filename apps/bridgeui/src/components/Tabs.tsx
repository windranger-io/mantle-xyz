'use client'

import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { clsx } from 'clsx'
import { SimpleCard } from '@mantle/ui'
import Deposit from './Deposit'
import Withdraw from './Withdraw'

export default function Tabs() {
  const [categories] = useState({
    Deposit: [<Deposit />],
    Withdraw: [<Withdraw />],
  })

  return (
    <SimpleCard className="max-w-lg w-full  grid gap-4 relative">
      <Tab.Group>
        <Tab.List className="flex space-x-5 rounded-[10px] bg-white/[0.05] p-1">
          {Object.keys(categories).map((category, index) => (
            <span key={`cat-${category || index}`}>
              <Tab
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium transition-all',
                    'ring-white ring-opacity-0 ring-offset-0 ring-offset-white focus:outline-none focus:ring-2',
                    selected
                      ? 'text-type-inversed bg-white shadow'
                      : 'text-white hover:bg-white/[0.12] hover:text-white',
                  )
                }
              >
                {category}
              </Tab>
            </span>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.keys(categories).map((category, index) => (
            <span key={`tab-${category || index}`}>
              <Tab.Panel
                key={`tabPanel-${category || index}`}
                className={clsx('')}
                style={{ color: '#fff' }}
              >
                {categories[category as keyof typeof categories][0]}
              </Tab.Panel>
            </span>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </SimpleCard>
  )
}
