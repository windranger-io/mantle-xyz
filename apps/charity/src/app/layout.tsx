import "./styles/globals.css";

// Dummy components
import {
  GTWalsheim,
  PageWrapper,
  // PageBackroundImage,
  PageContainer,
  SlimFooter,
} from "@mantle/ui";

import Head from "@app/head";
import Providers from "@app/providers";

import Nav from "@components/Nav";
import CONST from "@mantle/constants";

// import bgDesktop from "../../public/bg/bg-header-desktop.png";
// import bgIpad from "../../public/bg/bg-ipad.png";
// import bgIpadMini from "../../public/bg/bg-ipad-mini.png";
// import bgMobile from "../../public/bg/bg-mobile.png";

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
            // TODO: setup different bg image here
            // siteBackroundImage={
            //   <PageBackroundImage
            //     imgSrc={bgDesktop}
            //     altDesc="Charity Background Image"
            //   />
            // }
            header={<Nav />}
            className="min-h-screen justify-between"
          >
            <PageContainer className="grow items-center">
              {children}
            </PageContainer>
            <SlimFooter url={CONST.WEBSITE} />
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
