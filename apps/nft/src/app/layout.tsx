import "./styles/globals.css";
import { GTWalsheimRegular, GTWalsheimMedium } from "@mantle/ui";

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
      <body>{children}</body>
    </html>
  );
}
