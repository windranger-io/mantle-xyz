'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button, Typography } from '@mantle/ui'

const TWITTER_LINK = 'https://twitter.com/0xMantle'
const EXPLORER_LINK = 'https://explorer.testnet.mantle.xyz'
const ECOSYSTEM_LINK = 'https://www.mantle.xyz/ecosystem'
const CHAINLIST = 'https://chainlist.org/chain/5000'

function EthccSuccess() {
  return (
    <div className="max-w-[430px] mx-auto border-2">
      <div className="w-full min-h-screen flex flex-col z-10 px-4 pt-28 pb-6">
        <div className="flex flex-col items-center text-center space-y-4 mx-auto">
          <Image
            className="cursor-pointer select-none"
            width="190"
            height="160"
            src="/ethcc-success.png"
            alt=""
            quality={100}
          />
          <Typography
            variant="appPageHeading"
            className="w-[290px] font-medium text-[42px] leading-[50px] tracking-[-0.14rem]"
          >
            60 $MNT <br /> has been sent to your wallet
          </Typography>
          <Link
            href={CHAINLIST}
            rel="noreferrer noopener"
            target="_blank"
            className="flex text-[#0A8FF6]"
          >
            <Image
              className="cursor-pointer select-none mr-2"
              width="15"
              height="15"
              src="/external-link.svg"
              alt=""
              quality={100}
            />
            Add Mantle Network to your wallet
          </Link>
          <Link
            href={EXPLORER_LINK}
            rel="noreferrer noopener"
            target="_blank"
            className="flex text-[#0A8FF6]"
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

        {/* BUTTONS */}
        <div className="flex flex-col space-y-4 mt-auto">
          <Link href={TWITTER_LINK} target="_blank" rel="noreferrer noopener">
            <Button
              type="button"
              variant="secondary"
              size="full"
              className="h-14 font-medium flex items-center justify-center"
            >
              <Image
                className="cursor-pointer select-none mr-2"
                width="15"
                height="15"
                src="/social/twitter.svg"
                alt="social"
                quality={100}
              />
              Mantle Twitter
            </Button>
          </Link>
          <Link href={ECOSYSTEM_LINK} target="_blank" rel="noreferrer noopener">
            <Button
              type="button"
              variant="outline"
              size="full"
              className="h-14 font-medium"
            >
              Mantle Ecosystem
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default EthccSuccess
