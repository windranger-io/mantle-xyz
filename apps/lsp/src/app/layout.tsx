import "./styles/globals.css";

import {
  GTWalsheim,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  SlimFooter,
} from "@mantle/ui";

import Link from "next/link";
import Head from "@app/head";
import Providers from "@app/providers";
import Nav from "@components/Nav";
import CONST from "@mantle/constants";

import { Faq } from "@components/Faq";
import bridgeBG from "../../public/bridge-bg.png";

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
            <PageContainer className="grow items-center">
              <h1 className="GTWalsheimMedium text-[48px] text-type-primary text-center mb-8">
                Liquid Staking
              </h1>
              <div className="relative w-full lg:min-w-[484px] lg:w-[484px] flex flex-col md:flex-row lg:block lg:mx-auto ">
                {children}
                <div className="flex flex-col mt-4 sm:mt-0 xl:w-[280px] lg:w-[240px] md:max-w-[328px] md:min-w-[250px] lg:absolute lg:top-0 lg:-right-[260px] xl:-right-[396px] w-auto space-y-8">
                  <div className="max-w-[484px] relative border border-[#1C1E20] mx-auto rounded-xl w-full overflow-x-auto">
                    <p className="bg-black p-6">Stat panel here</p>
                  </div>
                  <div className="max-w-[484px] relative border border-[#1C1E20] mx-auto rounded-xl w-full overflow-x-auto">
                    <Faq />
                  </div>
                </div>
              </div>
              <div className="relative w-full lg:min-w-[484px] lg:w-[484px] flex flex-col md:flex-row lg:block lg:mx-auto mt-20 items-center justify-center">
                <p className="text-type-secondary text-center mt-8 md:mt-0">
                  By connecting your wallet to the Mantle Liquid Staking
                  Platform, you agree to our{" "}
                  <Link
                    href={CONST.NAV_LINKS_ABSOLUTE.TERMS_LINK}
                    className="underline"
                  >
                    T&Cs
                  </Link>{" "}
                  and our{" "}
                  <Link
                    href={CONST.NAV_LINKS_ABSOLUTE.PRIVACY_LINK}
                    className="underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </PageContainer>
            <SlimFooter url={CONST.WEBSITE} />
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
