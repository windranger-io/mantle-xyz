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

const navItems: NavItem[] = [
  {
    name: "Docs",
    href: "https://docs.mantle.xyz",
    internal: true,
    key: "docs",
  },
  {
    name: "Faucet",
    href: "https://faucet.testnet.mantle.xyz",
    internal: true,
    key: "faucet",
  },
  {
    name: "Bridge",
    href: "https://bridge.testnet.mantle.xyz",
    internal: true,
    key: "bridge",
  },
  {
    name: "Account",
    href: "https://bridge.testnet.mantle.xyz/account/deposit",
    internal: true,
    key: "account",
  },
];

function Nav({ className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);

  return (
    <Header
      navLite
      walletConnect={<ConnectWallet />}
      className={className}
      activeKey="faucet"
      // Faucet should only be on testnet
      navItems={navItems}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  );
}

export default Nav;
