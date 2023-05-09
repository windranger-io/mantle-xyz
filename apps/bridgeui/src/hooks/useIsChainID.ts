"use client";

import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";

function useIsChainID(chainId: string | number) {
  const [isChainID, setIsChainId] = useState(false);
  const { chain: givenChain } = useNetwork();

  useEffect(() => {
    setIsChainId(givenChain?.id === parseInt(`${chainId}`, 10));

    return () => {
      setIsChainId(false);
    };
  }, [chainId, givenChain]);

  return isChainID;
}

export default useIsChainID;
