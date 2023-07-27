import './styles/globals.css'
import { GTWalsheim } from '@mantle/ui'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GTWalsheim.className}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
