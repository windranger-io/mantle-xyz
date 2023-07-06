"use client";

import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { usePathname } from "next/navigation";

type NavProps = {
  className: string;
  hideConnectBtn: boolean;
};

function Nav({ className, hideConnectBtn }: NavProps) {
  // use the given pathName to set active on navItem
  const pathName = usePathname();

  // these nav items will navigate internally
  const NAV_ITEMS = [
    {
      name: "Migrate",
      href: "/",
      internal: false,
      active: pathName === "/",
      shallow: true,
    },
    // {
    //   name: "Dashboard",
    //   href: "/dashboard",
    //   internal: true,
    //   active: pathName === "/dashboard",
    //   shallow: true,
    // },
  ];

  return (
    <Header
      navLite
      walletConnect={hideConnectBtn ? null : <ConnectWallet />}
      navItems={NAV_ITEMS}
      className={className}
    />
  );
}

export default Nav;
