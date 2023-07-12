"use client";

import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";

type NavProps = {
  className: string;
  hideConnectBtn: boolean;
};

function Nav({ className, hideConnectBtn }: NavProps) {
  return (
    <Header
      navLite
      walletConnect={hideConnectBtn ? null : <ConnectWallet />}
      className={className}
      activeKey="migrate"
    />
  );
}

export default Nav;
