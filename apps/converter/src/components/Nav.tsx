"use client";

import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";

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
      isTestnet={L1_CHAIN_ID === 5 || L2_CHAIN_ID === 5001}
    />
  );
}

export default Nav;
