import "./styles/globals.css";

// Dummy components
import {
  GTWalsheimRegular,
  GTWalsheimMedium,
  Header,
  Footer,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  Typography,
} from "@mantle/ui";

import CONST from "@mantle/constants";
import ConnectWallet from "@components/ConnectWallet";
import bridgeBG from "../../public/bridge-bg.png";
import Providers from "./providers";

const NAV_ITEMS = [
  {
    name: "Docs",
    href: CONST.RESOURCE_LINKS.DOC_LINK || "#",
    internal: false,
    active: false,
  },
  {
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
];

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
          >
            <PageContainer className="gap-8">
              <Typography variant="appPageHeading" className="text-center">
                Testnet Bridge
              </Typography>
              {children}
              <div>
                <Footer />
              </div>
            </PageContainer>
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
