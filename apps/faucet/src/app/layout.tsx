import "./styles/globals.css";

import { GTWalsheim } from "@mantle/ui";
import Providers from "./providers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GTWalsheim.className}`}>
      <body className="antialiased">
        {/* @ts-expect-error Server Component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
