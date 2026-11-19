'use client'

import { ChangeEvent, useEffect, useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { Typography, Button } from '@mantle/ui'
import BackgroundVideo from './BackgroundVideo'

const EXPLORER_LINK = 'https://explorer.testnet.mantle.xyz'

// fake ERC20 testing address
// 0xAbcDef0123456789AbcDef0123456789AbcDef01

function Ethcc() {
  const [ercAddress, setERCAddress] = useState('')
  const [isAddressValid, setIsAddressValid] = useState(true)
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [isClaimSubmitted, setIsClaimSubmitted] = useState(false)

  useEffect(() => {
    setIsButtonDisabled(ercAddress.trim().length === 0 || !isAddressValid)
  }, [ercAddress, isAddressValid])

  const validateERCAddress = (address: string): boolean => {
    // ERC address validation logic here
    // Check for correct format, length
    const validFormat = /^0x[a-fA-F0-9]{40}$/.test(address)
    // console.log(validFormat)
    return validFormat
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const address: string = event.target.value
    setERCAddress(address)
    setIsAddressValid(validateERCAddress(address))
  }

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault()

    if (isAddressValid) {
      // Perform necessary actions with the ERC address here, simulate the submission with a delay
      setIsClaimSubmitted(true)
      setTimeout(() => {
        setIsClaimSubmitted(false)
        setERCAddress('')
      }, 10000)
    } else {
      // console.log('Invalid ERC address')
    }
  }

  return (
    <div className="border max-w-[430px] mx-auto">
      <BackgroundVideo />

      <div className="w-full min-h-screen flex flex-col z-10 px-4 pt-24 pb-6">
        <div className="flex flex-col items-center text-center space-y-4 mx-auto">
          {/* TITLE */}
          <Typography
            variant="appPageHeading"
            className="font-medium text-[42px] leading-[50px] tracking-[-0.14rem]"
          >
            $MNT Starter Pack
          </Typography>
          {/* TAG */}
          <p className="leading-5 px-4 py-2 bg-neutral-900 rounded-[10px]">
            EthCC 2023
          </p>
        </div>

        {isClaimSubmitted ? (
          <div className="flex flex-col mx-auto mt-6 space-y-8 text-center">
            <div className="w-[260px] mx-auto mt-6 text-center font-normal text-[14px] md:text-[16px] leading-[140%] text-type-secondary">
              Your $MNT reward claiming request has been submitted successfully,
              please wait
            </div>
            <div className="flex items-center justify-center py-4">
              <Image
                src="/preloader_animation.gif"
                width="80"
                height="80"
                alt="Mantle loading wheel"
              />
            </div>
            {/* BUTTON link */}
            <Link
              href={EXPLORER_LINK}
              rel="noreferrer noopener"
              target="_blank"
              className="flex mx-auto text-[#0A8FF6]"
            >
              <Image
                className="cursor-pointer select-none mr-2"
                width="15"
                height="15"
                src="/external-link.svg"
                alt=""
                quality={100}
              />
              Mantle Explorer
            </Link>
          </div>
        ) : (
          <>
            <div className="w-[260px] mx-auto mt-6 text-center font-normal text-[14px] leading-[140%] text-type-secondary">
              Thank you for your support to Mantle, enter your ERC20 address
              below to claim $MNT on Mantle Network (L2)
            </div>

            {/* INPUT AREA */}
            <div className="mt-8 mb-4">
              <div className="p-2 text-type-secondary font-normal text-[14px] leading-[140%]">
                Your ERC20 address
              </div>
              <textarea
                id="erc-address"
                name="erc-address"
                value={ercAddress}
                onChange={handleChange}
                required
                placeholder="0x..."
                className={`w-full py-1.5 px-3 bg-black border ${
                  isAddressValid
                    ? 'focus:border-neutral-400'
                    : 'focus:border-red-500'
                } focus:outline-none rounded-lg focus:ring-0  appearance-none`}
              />
              {!isAddressValid && (
                <p className="text-red-500 flex">
                  <Image
                    className="cursor-pointer select-none mr-2"
                    width="15"
                    height="15"
                    src="/warn.svg"
                    alt=""
                    quality={100}
                  />
                  Make sure the address is correct.
                </p>
              )}
            </div>
            {/* BUTTON BOTTOM */}
            <Button
              type="button"
              variant="secondary"
              size="full"
              className="h-14 mt-auto font-medium disabled:outline-none disabled:border-none disabled:bg-zinc-500 disabled:text-zinc-700"
              onClick={handleSubmit}
              disabled={isButtonDisabled}
            >
              Claim reward
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default Ethcc
