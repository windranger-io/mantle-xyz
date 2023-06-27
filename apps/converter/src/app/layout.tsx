import "./styles/globals.css";

// Dummy components
import {
  GTWalsheimRegular,
  GTWalsheimMedium,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  MantleLogoIcon,
} from "@mantle/ui";
import CONST from "@mantle/constants";

import Head from "@app/head";
import Providers from "@app/providers";

import Nav from "@components/Nav";

import bridgeBG from "../../public/bridge-bg.png";

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
            header={<Nav className="mb-0 m-0" />}
          >
            <PageContainer>
              {children}
              <div className="flex justify-center items-center pt-52">
                <div>
                  <a
                    href={CONST.WEBSITE}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="inline-block"
                  >
                    <div className="flex flex-row align-center gap-4">
                      <MantleLogoIcon height={40} width={40} />
                      <div className="flex items-center">
                        Mantle {new Date().getFullYear()}&nbsp;&#169;
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </PageContainer>
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
