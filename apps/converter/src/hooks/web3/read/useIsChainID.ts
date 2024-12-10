"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export function useIsChainID(chainId: string | number) {
  const [isChainID, setIsChainId] = useState(false);
  const { chain: givenChain } = useAccount();

  useEffect(() => {
    setIsChainId(givenChain?.id === parseInt(`${chainId}`, 10));

    return () => {
      setIsChainId(false);
    };
  }, [chainId, givenChain]);

  return isChainID;
}

export default useIsChainID;
