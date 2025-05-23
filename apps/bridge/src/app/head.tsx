import {
  ABSOLUTE_PATH,
  APP_NAME,
  // L1_CHAIN_ID,
  // L2_CHAIN_ID,
  META,
  OG_TITLE,
  TWITTER_DESC,
  TWITTER_TITLE,
} from "@config/constants";
import { MetaCRM } from "@mantle/ui";
import Script from "next/script";

export default function Head() {
  // const isTestnet = L1_CHAIN_ID === 5 || L2_CHAIN_ID === 5001;

  return (
    <>
      <title>{APP_NAME}</title>
      <link rel="icon" href="/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${OG_TITLE}`} />
      <meta property="og:image" content={`${ABSOLUTE_PATH}/opengraph.png`} />
      <meta name="description" content={`${META}`} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@0xMantle" />
      <meta name="twitter:title" content={`${TWITTER_TITLE}`} />
      <meta name="twitter:creator" content="@0xMantle" />
      <meta name="twitter:description" content={`${TWITTER_DESC}`} />
      <meta name="twitter:image" content={`${ABSOLUTE_PATH}/twitter.png`} />
      <meta name="google" content="nositelinkssearchbox" />
      {/* have migrated to https://app.mantle.xyz/bridge/ */}
      {/* <Cookies
        siteId={
          isTestnet
            ? "c8c0f51d-eaf1-42f0-9cb9-c73f01024b0e"
            : "2adc2f79-be37-433c-8c01-f44bd45297ac"
        }
      /> */}
      <MetaCRM />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-84NZKTFJ7S"
      />
      <Script strategy="afterInteractive" id="google-analytics">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-84NZKTFJ7S');`}
      </Script>
    </>
  );
}
