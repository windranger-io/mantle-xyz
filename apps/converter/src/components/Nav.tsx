"use client";

import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { usePathname } from "next/navigation";

function Nav({ className }: { className: string }) {
  // use the given pathName to set active on navItem
  const pathName = usePathname();

  // these nav items will navigate internally
  const NAV_ITEMS = [
    {
      name: "Converter",
      href: "/",
      internal: true,
      active: pathName === "/",
      shallow: true,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      internal: true,
      active: pathName === "/dashboard",
      shallow: true,
    },
  ];

  return (
    <Header
      navLite
      walletConnect={<ConnectWallet />}
      navItems={NAV_ITEMS}
      className={className}
    />
  );
}

export default Nav;
