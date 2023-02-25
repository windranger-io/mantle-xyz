import "./styles/globals.css";

import Providers from "./providers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* @ts-expect-error Server Component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
