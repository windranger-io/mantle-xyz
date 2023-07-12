import "./styles/globals.css";

// Dummy components
import {
  GTWalsheimRegular,
  GTWalsheimMedium,
  Header,
  SlimFooter,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
} from "@mantle/ui";

import { L1_CHAIN_ID } from "@config/constants";

import CONST from "@mantle/constants";
import ConnectWallet from "@components/ConnectWallet";
import Head from "./head";
import bridgeBG from "../../public/bridge-bg.png";
import Providers from "./providers";

const NAV_ITEMS = [
  L1_CHAIN_ID !== 1 && {
    name: "Docs",
    href: CONST.RESOURCE_LINKS.DOC_LINK || "#",
    internal: false,
    active: false,
  },
  L1_CHAIN_ID !== 1 && {
    name: "Faucet",
    href: CONST.RESOURCE_LINKS.FAUCET_LINK || "#",
    internal: false,
    active: false,
  },
  {
    name: "Bridge",
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || "#",
    internal: false,
    active: true,
  },
].filter((v) => v);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GTWalsheimRegular.variable} ${GTWalsheimMedium.variable}`}
    >
      <Head />
      <body>
        {/* @ts-expect-error Server Component */}
        <Providers>
          <PageWrapper
            siteBackroundImage={
              <PageBackroundImage
                imgSrc={bridgeBG}
                altDesc="Bridge Background Image"
              />
            }
            header={
              <Header
                navLite
                walletConnect={<ConnectWallet />}
                navItems={NAV_ITEMS}
              />
            }
            className="min-h-screen justify-between"
          >
            <PageContainer className="gap-8 min-h-fit justify-between">
              {children}
            </PageContainer>
            <SlimFooter url={CONST.WEBSITE} />
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
