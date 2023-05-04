/* eslint-disable react/jsx-no-bind */
import { Button, Typography } from '@mantle/ui'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

import { MdClear } from 'react-icons/md'

/**
 *
 * @todo MORE TO SEPERATE COMPONENT
 *
 */

function Values({
  label,
  value,
  border = false,
}: {
  label: string
  value: string
  border: boolean
}) {
  return (
    <div className="flex flex-col  my-5 ">
      <div className="text-type-secondary">{label}</div>
      <div className="text-xl mb-5 text-white">{value}</div>
      {border && (
        <div className="w-full" style={{ borderBottom: '1px solid #41474D' }} />
      )}
    </div>
  )
}

export default function CTA() {
  const [isOpen, setIsOpen] = useState(true)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <Button type="button" size="full" onClick={openModal}>
        Open dialog
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all space-y-10">
                  <Dialog.Title className="flex justify-between align-middle">
                    <Typography variant="modalHeading">
                      Confirm Transaction
                    </Typography>
                    <Typography variant="modalHeading" className="text-white">
                      <MdClear
                        onClick={closeModal}
                        className="cursor-pointer"
                      />
                    </Typography>
                  </Dialog.Title>

                  <Values label="Amount to deposit" value="0.01 Eth" border />
                  <Values label="Time to transfer" value="5 Minutes" border />
                  <Values
                    label="Time to transfer"
                    value="5 Minutes"
                    border={false}
                  />
                  <Button size="full">Confirm</Button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
