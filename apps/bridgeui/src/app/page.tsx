// Dummy components
import {
  Header,
  Footer,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  Typography,
  Button,
} from '@mantle/ui'
// Page components

import CONST from '@mantle/constants'
import Tabs from 'src/components/Tabs'
import bridgeBG from '../../public/bridge-bg.png'

/**
 *
 * @todo Updated with real components and content when ready
 *
 */

const NAV_ITEMS = [
  {
    name: 'Docs',
    href: CONST.RESOURCE_LINKS.DOC_LINK || '#',
    internal: false,
    active: false,
  },
  {
    name: 'Faucet',
    href: CONST.RESOURCE_LINKS.FAUCET_LINK || '#',
    internal: false,
    active: false,
  },
  {
    name: 'Bridge',
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || '#',
    internal: false,
    active: true,
  },
]

export default async function Page() {
  return (
    <PageWrapper
      siteBackroundImage={
        <PageBackroundImage
          imgSrc={bridgeBG}
          altDesc="Faucet Background Image"
        />
      }
      header={
        <Header
          navLite
          walletConnect={<Button>WALLET CONNECT???</Button>}
          navItems={NAV_ITEMS}
        />
      }
    >
      <PageContainer className="gap-8">
        <Typography variant="appPageHeading" className="text-center">
          Bridge UI
        </Typography>
        <Tabs />

        <div>
          <Footer />
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
