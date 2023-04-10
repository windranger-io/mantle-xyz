"use client";

import React from "react";
import { signIn, signOut } from "next-auth/react";

import useHasTweeted from "@hooks/useHasTweeted";
import { Button, SimpleCard } from "@mantle/ui";
import Link from "next/link";
import { Description, Heading } from "./Headings";

function AuthTwitter({
  tweets,
}: {
  tweets: {
    id: string;
    text: string;
  }[];
}) {
  // if is verified then disable ui
  const hasTweeted = useHasTweeted(tweets);
  // and display verification checkmark
  // const checkmark = hasTweeted ? (
  //   <>
  //     {"\u00A0\u00A0"}
  //     <Image src="/assets/checked.svg" alt="✅" width={14} height={15} />
  //   </>
  // ) : (
  //   <span />
  // );

  return (
    <SimpleCard className="max-w-lg grid gap-4">
      <Heading numDisplay="1" header="Authenticate with Twitter" />

      <Description>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
        {hasTweeted ? (
          <>
            {" - "}
            <button type="button" className="" onClick={() => signOut()}>
              [disconnect]
            </button>
          </>
        ) : (
          <span />
        )}
      </Description>

      <div className="flex flex-row gap-4">
        <Link
          href="https://twitter.com/intent/tweet?text=To%20%23BuildonMantle%2C%20I%20am%20claiming%20test%20%24BIT%20tokens%20on%20faucet.testnet.mantle.xyz%20for%20%400xMantle%2C%20a%20next%20generation%20high-performance%20modular%20%40Ethereum%20L2%20built%20for%20hyperscaled%20dApps.%0A%0ALearn%20more%3A%20%5Bhttps%3A%2F%2Flinktr.ee%2Fmantle.xyz%5D"
          target="_blank"
          rel="noreferrer"
          passHref
          className="w-full"
        >
          <Button
            variant="secondary"
            size="full"
            disabled={hasTweeted || false}
            className=""
          >
            Send Tweet
          </Button>
        </Link>

        <Button
          variant="primary"
          size="full"
          type="button"
          disabled={hasTweeted || false}
          className=""
          onClick={() => signIn("twitter")}
        >
          Verify Tweet
        </Button>
      </div>
    </SimpleCard>
  );
}

export default AuthTwitter;
