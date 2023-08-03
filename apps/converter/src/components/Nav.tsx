"use client";

import { useContext } from "react";
import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import StateContext from "@providers/stateContext";

type NavProps = {
  hideConnectBtn: boolean;
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
};

function Nav({ hideConnectBtn, className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);

  return (
    <Header
      navLite
      walletConnect={hideConnectBtn ? null : <ConnectWallet />}
      className={className}
      activeKey="migrate"
      isTestnet={L1_CHAIN_ID === 5 || L2_CHAIN_ID === 5001}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  );
}

export default Nav;
