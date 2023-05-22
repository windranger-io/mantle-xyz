import Script from 'next/script'

type GoogleAnalyticsProps = {
  GA_TRACKING_ID?: string
}

export const GoogleAnalytics = ({
  GA_TRACKING_ID,
}: GoogleAnalyticsProps): JSX.Element => {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!GA_TRACKING_ID) return <></> // Return an empty fragment instead of null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
    </>
  )
}

GoogleAnalytics.defaultProps = {
  GA_TRACKING_ID: undefined,
}
