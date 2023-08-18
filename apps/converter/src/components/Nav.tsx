"use client";

import { useContext } from "react";
import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import StateContext from "@providers/stateContext";
import { NavItem } from "@mantle/ui/src/navigation/NavigationLite";

import { usePathname } from "next/navigation";

type NavProps = {
  hideConnectBtn: boolean;
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
};

const NAV_ITEMS: NavItem[] = [
  {
    name: "Docs",
    href: "https://docs.mantle.xyz",
    internal: true,
    key: "docs",
  },
  {
    name: "Migrate",
    href: "https://migratebit.mantle.xyz",
    internal: true,
    key: "migrate",
  },
  {
    name: "Bridge",
    href: "https://bridge.mantle.xyz",
    internal: true,
    key: "bridge",
  },
  {
    name: "Account",
    href: "/account/migrate",
    internal: true,
    key: "account",
  },
];

const NAV_ITEMS_TESTNET: NavItem[] = [
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
    href: "/account/migrate",
    internal: true,
    key: "account",
  },
];

function Nav({ hideConnectBtn, className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);
  const pathName = usePathname();

  const activeKey = pathName.includes("account") ? "account" : "migrate";

  const isTestnet = L1_CHAIN_ID === 5 || L2_CHAIN_ID === 5001;
  const navItems = isTestnet ? NAV_ITEMS_TESTNET : NAV_ITEMS;

  return (
    <Header
      navLite
      walletConnect={hideConnectBtn ? null : <ConnectWallet />}
      className={className}
      activeKey={activeKey}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
      navItems={navItems}
    />
  );
}

export default Nav;
