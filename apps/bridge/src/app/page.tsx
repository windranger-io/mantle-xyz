'use client'

import {
  Header,
  Footer,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  Typography,
  Button,
} from '@mantle/ui'

import CONST from '@mantle/constants'
import Demos from 'src/components/demos'

import { ReactQueryProvider } from 'src/providers/react-query-context'
import { WagmiProvider } from 'src/providers/wagmi-context'
import faucetBG from '../../public/faucet-bg.png'

const NAV_ITEMS = [
  {
    name: 'Docs',
    href: CONST.RESOURCE_LINKS.DOC_LINK || '#',
    internal: false,
  },
  {
    name: 'Faucet',
    href: CONST.RESOURCE_LINKS.FAUCET_LINK || '#',
    internal: false,
  },
  {
    name: 'Bridge',
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || '#',
    internal: false,
  },
]

/**
 *
 * @todo Updated with real components and content when ready
 */
export default function Page() {
  return (
    <PageWrapper
      siteBackroundImage={
        <PageBackroundImage
          // UPDATE WITH DIFFERENT IMAGE
          imgSrc={faucetBG}
          altDesc="Faucet Background Image"
        />
      }
      header={
        <Header
          navLite
          walletConnect={<Button>Wallet Connect???</Button>}
          navItems={NAV_ITEMS}
        />
      }
    >
      <PageContainer className="gap-8">
        <Typography variant="appPageHeading" className="text-center">
          Bridge
        </Typography>
        <ReactQueryProvider>
          <WagmiProvider>
            <Demos />
          </WagmiProvider>
        </ReactQueryProvider>
        <div>
          <Footer />
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
