import "./styles/globals.css";

// Dummy components
import {
  SlimFooter,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  GTWalsheim,
} from "@mantle/ui";
import LegalDisclaimer from "@components/LegalDisclaimer";
import CONST from "@mantle/constants";
import { L1_CHAIN_ID } from "@config/constants";
import Nav from "@components/Nav";
import Head from "./head";
import bridgeBG from "../../public/bridge-bg.png";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GTWalsheim.className}`}>
      <Head />
      <body className="antialiased">
        {/* @ts-expect-error Server Component */}
        <Providers>
          <PageWrapper
            siteBackroundImage={
              (
                <PageBackroundImage
                  imgSrc={bridgeBG}
                  altDesc="Bridge Background Image"
                />
              ) as React.ReactNode
            }
            header={<Nav />}
            className="min-h-screen justify-between"
          >
            <PageContainer className="min-h-fit justify-between">
              {children}
            </PageContainer>
            <SlimFooter url={CONST.WEBSITE} />
            {L1_CHAIN_ID === 1 ? <LegalDisclaimer /> : ""}
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
