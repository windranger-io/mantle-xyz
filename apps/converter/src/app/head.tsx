import {
  ABSOLUTE_PATH,
  APP_NAME,
  META,
  OG_TITLE,
  TWITTER_DESC,
  TWITTER_TITLE,
} from "@config/constants";
import { Cookies } from "@mantle/ui";

export default function Head() {
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
      <Cookies siteId="7d12f021-be7f-4719-8c01-155f90243963" />
    </>
  );
}
