"use client";

import React from "react";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";

import useHasTweeted from "@hooks/useHasTweeted";

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
  const checkmark = hasTweeted ? (
    <>
      {"\u00A0\u00A0"}
      <Image src="/assets/checked.svg" alt="✅" width={14} height={15} />
    </>
  ) : (
    <span />
  );

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-md mt-8 pb-4">
      <div className="flex flex-col text-xs bg-slate-900 p-4 rounded-md gap-4">
        <div>
          To request funds via the faucet, you must first send a tweet to signal
          your interest...
          {hasTweeted ? (
            <>
              {" - "}
              <button
                type="button"
                className="text-gray-400 hover:text-white"
                onClick={() => signOut()}
              >
                [disconnect]
              </button>
            </>
          ) : (
            <span />
          )}
        </div>
      </div>
      <div className="flex flex-row gap-4 mx-auto w-full">
        <div className="bg-slate-900 rounded-md p-4 w-1/2 flex align-middle justify-center">
          <a
            className={`my-4 outline rounded p-3 hover:bg-slate-900 inline-flex items-center justify-center ${
              hasTweeted
                ? `pointer-events-none text-gray-400 outline-gray-400`
                : ``
            }`}
            href="https://twitter.com/intent/tweet?text=To%20%23BuildonMantle%2C%20I%20am%20claiming%20test%20%24BIT%20tokens%20on%20faucet.testnet.mantle.xyz%20for%20%400xMantle%2C%20a%20next%20generation%20high-performance%20modular%20%40Ethereum%20L2%20built%20for%20hyperscaled%20dApps.%0A%0ALearn%20more%3A%20%5Bhttps%3A%2F%2Flinktr.ee%2Fmantle.xyz%5D"
            target="_blank"
            rel="noreferrer"
          >
            Send Tweet{checkmark}
          </a>
        </div>
        <div className="bg-slate-900 rounded-md p-4 w-1/2">
          <button
            type="button"
            disabled={hasTweeted || false}
            className="my-4 outline rounded p-3 disabled:text-gray-400 hover:bg-slate-900 inline-flex items-center justify-center"
            onClick={() => signIn("twitter")}
          >
            Verify Tweet{checkmark}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthTwitter;
