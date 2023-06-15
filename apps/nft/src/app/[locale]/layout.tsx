import "../styles/globals.css";
import { GTWalsheimRegular, GTWalsheimMedium } from "@mantle/ui";
import { useLocale } from "next-intl";

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
      <body>{children}</body>
    </html>
  );
}
