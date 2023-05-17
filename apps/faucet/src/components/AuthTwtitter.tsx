"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

import { Button, SimpleCard, Typography } from "@mantle/ui";

import { AiOutlineCheckCircle } from "react-icons/ai";

import { BirdIcon } from "@mantle/ui/src/base/Icons";
import { CardHeading } from "./CardHeadings";

function AuthTwitter() {
  // if is verified then disable ui

  const { data: session } = useSession();
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
    <SimpleCard className="max-w-lg w-full  grid gap-4">
      <CardHeading numDisplay="1" header="Authenticate" />

      {session ? (
        <div className="flex flex-col gap-4  items-center justify-center">
          <AiOutlineCheckCircle className="text-status-success block text-5xl" />{" "}
          <Typography variant="body">
            <div className="flex  gap-2 text-lg">
              <div>Authenticated:</div>

              <div> {session?.user?.username}</div>
            </div>
          </Typography>
        </div>
      ) : (
        <Typography variant="body" className="text-center  mb-4">
          Authenticate with your twitter account.
        </Typography>
      )}
      {session ? (
        <div className="flex flex-row justify-center align-baseline ">
          <Button type="button" variant="ghost" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      ) : null}

      {!session && (
        <Button
          variant="secondary"
          size="full"
          type="button"
          className=""
          onClick={() => signIn("twitter")}
        >
          <div className="flex justify-center gap-2 items-center">
            <BirdIcon />
            Authenticate
          </div>
        </Button>
      )}
    </SimpleCard>
  );
}

export default AuthTwitter;
