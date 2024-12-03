"use client";

import { useContext } from "react";
import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import StateContext from "@providers/stateContext";
import { NavItem } from "@mantle/ui/src/navigation/NavigationLite";

type NavProps = {
  hideConnectBtn: boolean;
  className?: string | undefined;
};

const NAV_ITEMS: NavItem[] = [
  {
    name: "Bridge",
    href: "https://app.mantle.xyz/bridge",
    internal: true,
    key: "bridge",
  },
  {
    name: "Liquid Staking",
    href: "/",
    internal: true,
    key: "lsp",
  },
  {
    name: "Account",
    href: "https://app.mantle.xyz/bridge/history",
    internal: true,
    key: "account",
  },
];

function Nav({ hideConnectBtn, className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);

  return (
    <Header
      navLite
      walletConnect={hideConnectBtn ? null : <ConnectWallet />}
      className={className}
      activeKey="lsp"
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      navItems={NAV_ITEMS}
    />
  );
}

export default Nav;
