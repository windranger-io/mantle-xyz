'use client'

import { Page as PageWrapper, Container } from '@mantle/ui'
import Demos from 'src/components/demos'
import { ReactQueryProvider } from 'src/providers/react-query-context'
import { WagmiProvider } from 'src/providers/wagmi-context'

/**
 *
 * @todo Updated with real components and content when ready
 */
export default function Page() {
  return (
    <PageWrapper>
      <Container>
        <ReactQueryProvider>
          <WagmiProvider>
            <Demos />
          </WagmiProvider>
        </ReactQueryProvider>
      </Container>
      <footer className="flex h-24 w-full items-center justify-center border-t text-gray-50">
        Powered by BIT
      </footer>
    </PageWrapper>
  )
}
