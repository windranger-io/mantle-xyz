"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

import useHasTweeted from "@hooks/useHasTweeted";
import { Button, SimpleCard, Typography } from "@mantle/ui";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsTwitter as BirdIcon } from "react-icons/bs";
import { CardHeading } from "./CardHeadings";

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

      {!hasTweeted ? (
        <Typography variant="body" className="text-center  mb-4">
          Authenticate with your twitter account.
        </Typography>
      ) : (
        <div className="flex flex-col gap-4  items-center justify-center">
          <AiOutlineCheckCircle className="text-status-success block text-5xl" />{" "}
          <Typography variant="body">
            <div className="flex  gap-2 text-lg">
              <div>Authenticated:</div>

              <div> {session?.user.username}</div>
            </div>
          </Typography>
        </div>
      )}

      {hasTweeted ? (
        <div className="flex flex-row justify-center align-baseline ">
          <Button type="button" variant="ghost" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      ) : null}

      {!hasTweeted ? (
        <Button
          variant="secondary"
          size="full"
          type="button"
          disabled={hasTweeted || false}
          onClick={() => signIn("twitter")}
        >
          <div className="flex justify-center gap-2 items-center">
            <BirdIcon style={{ color: "#0A8FF6", fontSize: "34px" }} />
            Authenticate
          </div>
        </Button>
      ) : null}
    </SimpleCard>
  );
}

export default AuthTwitter;
