import "./styles/globals.css";
import Image from "next/image";

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

import bgDesktop from "../../public/bg/bg-header-desktop.png";
import bgIpad from "../../public/bg/bg-ipad.png";
import bgIpadMini from "../../public/bg/bg-ipad-mini.png";
import bgMobile from "../../public/bg/bg-mobile.png";

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
            header={<Nav />}
            className="min-h-screen justify-between"
          >
            <div className="xl:block hidden absolute top-0 h-[80%] w-screen top-0 overflow-hidden z-pageBackgroundImage">
              <Image
                alt="Charity Background Image"
                src={bgDesktop}
                placeholder="blur"
                quality={100}
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="xl:hidden lg:block hidden absolute top-0 h-[80%] w-screen top-0 overflow-hidden z-pageBackgroundImage">
              <Image
                alt="Charity Background Image"
                src={bgIpad}
                placeholder="blur"
                quality={100}
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="lg:hidden md:block hidden absolute top-0 h-[80%] w-screen top-0 overflow-hidden z-pageBackgroundImage">
              <Image
                alt="Charity Background Image"
                src={bgIpadMini}
                placeholder="blur"
                quality={100}
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="md:hidden sm:block absolute top-0 h-[80%] w-screen top-0 overflow-hidden z-pageBackgroundImage">
              <Image
                alt="Charity Background Image"
                src={bgMobile}
                placeholder="blur"
                quality={100}
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
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
