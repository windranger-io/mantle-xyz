import Script from 'next/script'

export const Cookies = ({ siteId }: { siteId: string }) => {
  return (
    <Script
      src="https://cdn.markfi.xyz/scripts/analytics/0.11.24/cookie3.analytics.min.js"
      integrity="sha384-ihnQ09PGDbDPthGB3QoQ2Heg2RwQIDyWkHkqxMzq91RPeP8OmydAZbQLgAakAOfI"
      crossOrigin="anonymous"
      async
      strategy="lazyOnload"
      site-id={siteId}
    />
  )
}
