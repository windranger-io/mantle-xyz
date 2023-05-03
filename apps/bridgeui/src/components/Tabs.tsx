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
    <SimpleCard className="max-w-lg w-full  grid gap-4">
      <Tab.Group>
        <Tab.List className="flex space-x-5 rounded-[10px] bg-white/[0.05] p-1">
          {Object.keys(categories).map(category => (
            <Tab
              key={category}
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
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.values(categories).map(posts => (
            <Tab.Panel className={clsx('  p-3')} style={{ color: '#fff' }}>
              {posts}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </SimpleCard>
  )
}
