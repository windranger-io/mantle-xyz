"use client";

import { useContext } from "react";
import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import StateContext from "@providers/stateContext";
import { usePathname } from "next/navigation";

type NavProps = {
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
};

function Nav({ className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);
  const pathName = usePathname();

  const activeKey = pathName.includes("account") ? "account" : "bridge";

  return (
    <Header
      navLite
      walletConnect={<ConnectWallet />}
      className={className}
      activeKey={activeKey}
      isTestnet={L1_CHAIN_ID === 5 || L2_CHAIN_ID === 5001}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  );
}

export default Nav;
