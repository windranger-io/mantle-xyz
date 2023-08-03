"use client";

import { useContext } from "react";
import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import StateContext from "@providers/stateContext";

type NavProps = {
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
};

function Nav({ className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);

  return (
    <Header
      navLite
      walletConnect={<ConnectWallet />}
      className={className}
      activeKey="faucet"
      // Faucet should only be on testnet
      isTestnet
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  );
}

export default Nav;
