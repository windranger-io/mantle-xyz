import { APP_NAME, META, OG_TITLE, TWITTER_DESC } from "@config/constants";

export default function Head() {
  return (
    <>
      <title>{APP_NAME}</title>
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${OG_TITLE}`} />
      <meta
        property="og:image"
        content="https://mantle-prod.vercel.app/preview.jpg"
      />
      <meta name="description" content={`${META}`} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@0xMantle" />
      <meta name="twitter:title" content={`${APP_NAME}`} />
      <meta name="twitter:creator" content="@0xMantle" />
      <meta name="twitter:description" content={`${TWITTER_DESC}`} />
      <meta
        name="twitter:image:src"
        content="https://mantle-prod.vercel.app/preview.jpg"
      />
      <meta name="google" content="nositelinkssearchbox" />
    </>
  );
}
