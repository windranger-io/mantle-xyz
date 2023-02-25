"use client";

import { useEffect, useState } from "react";

import { REQUIRED_TWEET } from "@config/constants";

function useHasTweeted(
  tweets: {
    id: string;
    text: string;
  }[]
) {
  const [hasTweeted, setHasTweeted] = useState(false);

  useEffect(() => {
    setHasTweeted(
      !!tweets.find((tweet) => {
        return REQUIRED_TWEET.test(tweet.text);
      })
    );

    return () => {
      setHasTweeted(false);
    };
  }, [tweets]);

  return hasTweeted;
}

export default useHasTweeted;
