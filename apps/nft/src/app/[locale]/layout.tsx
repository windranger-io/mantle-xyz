import {
  APP_NAME,
  GOOGLE_TAG,
  META,
  OG_DESC,
  OG_TITLE,
} from "@config/constants";
import { GTWalsheimMedium, GTWalsheimRegular } from "@mantle/ui";
import { GoogleAnalytics } from "@src/components/GoogleAnalytics";
import { Metadata } from "next";
import { useLocale } from "next-intl";
import "../styles/globals.css";
import { Cookies } from "@src/components/Cookies";

export const metadata: Metadata = {
  title: APP_NAME,
  description: META,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    creators: "@0xMantle",
  },
  twitter: {
    title: OG_TITLE,
    description: OG_DESC,
    creator: "@0xMantle",
    site: "@0xMantle",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <html
      lang={locale}
      className={`${GTWalsheimRegular.variable} ${GTWalsheimMedium.variable}`}
    >
      <GoogleAnalytics GA_TRACKING_ID={GOOGLE_TAG} />
      <Cookies />

      {/* <Head /> */}

      <body>{children}</body>
    </html>
  );
}
