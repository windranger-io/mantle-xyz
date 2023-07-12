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

import CONST from "@mantle/constants";
import ConnectWallet from "@components/ConnectWallet";
import Head from "./head";
import bridgeBG from "../../public/bridge-bg.png";
import Providers from "./providers";

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
                activeKey="bridge"
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
