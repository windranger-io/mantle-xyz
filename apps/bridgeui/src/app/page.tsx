// Dummy components
import {
  Header,
  Footer,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  Typography,
} from "@mantle/ui";
// Page components
import Tabs from "@components/Tabs";
import CONST from "@mantle/constants";
import bridgeBG from "public/bridge-bg.png";
import ConnectWallet from "@components/ConnectWallet";
import { AdditionalLinks } from "@components/AdditionalLinks";

/**
 *
 * @todo Updated with real components and content when ready
 *
 */

const NAV_ITEMS = [
  {
    name: "Docs",
    href: CONST.RESOURCE_LINKS.DOC_LINK || "#",
    internal: false,
    active: false,
  },
  {
    name: "Faucet",
    href: CONST.RESOURCE_LINKS.FAUCET_LINK || "#",
    internal: false,
    active: false,
  },
  {
    name: "Bridge",
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || "#",
    internal: false,
    active: true,
  },
];

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
          walletConnect={<ConnectWallet />}
          navItems={NAV_ITEMS}
        />
      }
    >
      <PageContainer className="gap-8">
        <Typography variant="appPageHeading" className="text-center">
          Testnet Bridge
        </Typography>
        <Tabs />
        <AdditionalLinks />

        <div>
          <Footer />
        </div>
      </PageContainer>
    </PageWrapper>
  );
}
