import "../styles/globals.css";

import {
  GTWalsheim,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  SlimFooter,
} from "@mantle/ui";

import Head from "@app/head";
import Providers from "@app/providers";
import Nav from "@components/Nav";
import CONST from "@mantle/constants";

import bridgeBG from "../../../public/bridge-bg.png";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GTWalsheim.className}>
      <Head />
      <body className="antialiased">
        {/* @ts-expect-error Server Component */}
        <Providers>
          <PageWrapper
            siteBackroundImage={
              <PageBackroundImage
                imgSrc={bridgeBG}
                altDesc="Bridge Background Image"
              />
            }
            header={<Nav hideConnectBtn={false} />}
            className="min-h-screen justify-between"
          >
            <PageContainer className="w-full items-center justify-center">
              <div className="w-full max-w-7xl">{children}</div>
            </PageContainer>
            <SlimFooter url={CONST.WEBSITE} />
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
