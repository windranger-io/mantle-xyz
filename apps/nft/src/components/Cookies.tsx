import Script from "next/script";

export function Cookies() {
  return (
    <Script strategy="afterInteractive" id="cookie3-script">
      {`
      var cookie3Options = {"siteId": 127, "additionalTracking": true, "cookielessEnabled": true};
      window._paq = window._paq || [];
      (function () {
          var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
          g.async = true; g.src = 'https://cdn.cookie3.co/scripts/analytics/latest/cookie3.analytics.min.js'; s.parentNode.insertBefore(g, s);
      })();
      `}
    </Script>
  );
}
