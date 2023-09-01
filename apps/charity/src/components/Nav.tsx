"use client";

import { useContext } from "react";
import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import StateContext from "@providers/stateContext";
import { NavItem } from "@mantle/ui/src/navigation/NavigationLite";

type NavProps = {
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
};

const NAV_ITEMS: NavItem[] = [
  {
    name: "About Mantle",
    href: "https://www.mantle.xyz",
    internal: false,
    key: "mantle",
  },
  {
    name: "Mantle Journey",
    href: "https://journey.mantle.xyz",
    internal: false,
    key: "journey",
  },
  // {
  //   name: "About Web3Bridge",
  //   href: "https://www.web3bridge.com",
  //   internal: false,
  //   key: "web3bridge",
  // },
];

function Nav({ className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);
  // TODO: the style of nav items
  return (
    <Header
      navLite
      walletConnect={<ConnectWallet />}
      className={className}
      activeKey="" // no active key available as all nav links are external
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      navItems={NAV_ITEMS}
    />
  );
}

export default Nav;
