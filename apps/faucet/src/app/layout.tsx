import "./styles/globals.css";

import { GTWalsheimRegular, GTWalsheimMedium } from "@mantle/ui";
import Providers from "./providers";
import Head from "./head";

export default async function RootLayout({
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
