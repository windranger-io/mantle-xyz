"use client";

import { useContext } from "react";
import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import StateContext from "@providers/stateContext";
import { usePathname } from "next/navigation";
import { NavItem } from "@mantle/ui/src/navigation/NavigationLite";
import Link from "next/link";
import Image from "next/image";

type NavProps = {
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
};

function Nav({ className = "" }: NavProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useContext(StateContext);
  const pathName = usePathname();

  const activeKey = pathName.includes("account") ? "account" : "bridge";

  const isTestnet = L1_CHAIN_ID === 5 || L2_CHAIN_ID === 5001;

  const NAV_ITEMS: NavItem[] = [
    {
      name: "Docs",
      href: "https://docs-v2.mantle.xyz",
      internal: true,
      key: "docs",
    },
    {
      name: "Faucet",
      href: "https://faucet.sepolia.mantle.xyz",
      internal: true,
      key: "faucet",
    },
    // {
    //   name: "Migrate",
    //   href: "https://migratebit.mantle.xyz",
    //   internal: true,
    //   key: "migrate",
    // },
    {
      name: "Bridge",
      href: "/",
      internal: true,
      key: "bridge",
    },
    {
      name: "Account",
      href: pathName.includes("withdraw")
        ? "/account/withdraw"
        : "/account/deposit",
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
      href: pathName.includes("withdraw")
        ? "/account/withdraw"
        : "/account/deposit",
      internal: true,
      key: "account",
    },
  ];

  const navItems = isTestnet ? NAV_ITEMS_TESTNET : NAV_ITEMS;

  return (
    <>
      <div className="p-3 flex items-center justify-center text-sm bg-[#06DD76]/10 flex-wrap">
        <span className="text-[#C4C4C4]">
          Our new bridge is officially live!&nbsp;&nbsp;
        </span>
        <Link
          href="https://app.mantle.xyz/bridge"
          rel="noreferrer noopener"
          target="_blank"
          className="flex items-center  hover:underline"
        >
          Go to the new version&nbsp;
          <Image alt="arrow" src="/top-left-arrow.svg" width={7} height={7} />
        </Link>
      </div>

      <Header
        navLite
        walletConnect={<ConnectWallet />}
        className={className}
        activeKey={activeKey}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navItems={navItems}
      />
    </>
  );
}

export default Nav;
