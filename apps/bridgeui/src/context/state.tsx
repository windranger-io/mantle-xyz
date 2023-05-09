"use client";

import { createContext, useMemo, useState } from "react";

export type StateProps = {
  chainId: number;
  setChainId: (v: number) => void;
};

const StateContext = createContext<StateProps>({} as StateProps);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [chainId, setChainId] = useState(5);

  const context = useMemo(
    () => ({
      chainId,
      setChainId,
    }),
    [chainId, setChainId]
  );

  return (
    <StateContext.Provider value={context}>{children}</StateContext.Provider>
  );
}

export default StateContext;
