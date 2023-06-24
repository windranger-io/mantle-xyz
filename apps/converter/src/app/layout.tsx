import "./styles/globals.css";

// Dummy components
import {
  GTWalsheimRegular,
  GTWalsheimMedium,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
} from "@mantle/ui";

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
            header={<Nav className="mb-0" />}
          >
            <PageContainer>
              {children}
              {/* <div>
                <Footer page="converter" />
              </div> */}
            </PageContainer>
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
