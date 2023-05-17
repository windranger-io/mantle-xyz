"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button, SimpleCard, Typography } from "@mantle/ui";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BirdIcon } from "@mantle/ui/src/base/Icons";
import { CardHeading } from "./CardHeadings";

function AuthTwitter() {
  const { data: session } = useSession();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (session) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, [session]);

  return (
    <SimpleCard className="max-w-lg w-full grid gap-4">
      <CardHeading numDisplay="1" header="Authenticate" />

      {authenticated && session && (
        <>
          <div className="flex flex-col gap-4 items-center justify-center">
            <AiOutlineCheckCircle className="text-status-success block text-5xl" />

            <div className="flex gap-2 text-lg">
              <div>
                <Typography variant="body">Authenticated:</Typography>
              </div>
              <Typography variant="body">{session?.user?.username}</Typography>
            </div>
          </div>
          <div className="flex flex-row justify-center align-baseline">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                signOut();
              }}
            >
              Sign Out
            </Button>
          </div>
        </>
      )}

      {!authenticated && !session && (
        <>
          <Typography variant="body" className="text-center mb-4">
            Authenticate with your Twitter account.
          </Typography>
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
        </>
      )}
    </SimpleCard>
  );
}

export default AuthTwitter;
