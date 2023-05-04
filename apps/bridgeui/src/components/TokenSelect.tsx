import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { HiChevronDown } from 'react-icons/hi'
import { SiBitcoinsv, SiEthereum, SiDogecoin } from 'react-icons/si'
import clsx from 'clsx'

import DirectionLabel from './DirectionLabel'

const tokenList = [
  {
    id: 1,
    name: 'ETH',
    avatar: <SiEthereum />,
    amount: '6',
  },
  {
    id: 2,
    name: 'BIT',
    avatar: <SiBitcoinsv />,
    amount: '12,204.00',
  },
  {
    id: 3,
    name: 'Doge',
    avatar: <SiDogecoin />,
    amount: '204,041,000',
  },
]

export default function TokenSelect() {
  const [selected, setSelected] = useState(tokenList[1])

  return (
    <>
      <DirectionLabel
        direction="From"
        logo={<SiEthereum />}
        chain="Ethereum Mainnet"
      />
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <div className="relative ">
            <div className="flex text-lg ">
              <input
                type="text"
                className="grow  border border-stroke-inputs  focus:outline-none rounded-tl-lg rounded-bl-lg  bg-black py-1.5 px-3  ring-inset ring-stroke-inputs focus:ring-2 focus:ring-white  "
              />
              <Listbox.Button className="relative  cursor-default rounded-br-lg rounded-tr-lg  bg-black py-1.5 pl-5 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-stroke-inputs focus:outline-none focus:ring-2 focus:ring-white ">
                <span className="flex items-center">
                  {selected.avatar}

                  <span className="ml-2 block truncate">{selected.name}</span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-1 flex items-center pr-2">
                  <HiChevronDown
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-2.5 max-h-56 w-full overflow-auto rounded-lg bg-black py-0 text-lg shadow-lg ring-2 ring-white  focus:outline-none ">
                {tokenList.map(token => (
                  <Listbox.Option
                    key={token.id}
                    className={({ active }) =>
                      clsx(
                        active
                          ? 'bg-white/[0.12] text-white transition-all'
                          : 'text-type-secondary',
                        'relative cursor-default select-none py-4 pl-3 pr-9',
                      )
                    }
                    value={token}
                  >
                    {() => {
                      return (
                        <div className="flex justify-between">
                          <div className="flex items-center  ">
                            {token.avatar}

                            <span className={clsx('ml-3 block truncate ')}>
                              {token.name}
                            </span>
                          </div>
                          <div className="text-type-muted">{token.amount}</div>
                        </div>
                      )
                    }}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </>
  )
}
