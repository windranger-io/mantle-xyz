"use client";

import { Header } from "@mantle/ui/src/navigation/Header";
import ConnectWallet from "@components/ConnectWallet";
import { L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";

type NavProps = {
  hideConnectBtn: boolean;
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined;
};

function Nav({ hideConnectBtn, className = "" }: NavProps) {
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
