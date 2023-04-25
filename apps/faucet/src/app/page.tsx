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
import AuthTwitter from "@components/AuthTwtitter";
import ConnectWallet from "@components/ConnectWallet";
import MintTokens from "@components/MintTokens";

// Server-side components
import RecentTweets from "@server/RecentTweets";

// Extract session from caller
import { headers } from "next/headers";
import { AdditionalLinks } from "@components/AdditionalLinks";
import CONST from "@mantle/constants";
import faucetBG from "../../public/faucet-bg.png";
import { getSession } from "./session";

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
  },
  {
    name: "Faucet",
    href: CONST.RESOURCE_LINKS.FAUCET_LINK || "#",
    internal: false,
  },
  {
    name: "Bridge",
    href: CONST.RESOURCE_LINKS.BRIDGE_LINK || "#",
    internal: false,
  },
];

export default async function Page() {
  // * [Passing data between a parent layout and its children is not possible.
  //   However, you can fetch the same data in a route more than once, and React
  //   will automatically dedupe the requests without affecting performance.]
  //   (https://beta.nextjs.org/docs/routing/pages-and-layouts)
  const session = await getSession(headers().get("cookie") ?? "");
  // get the tweets server-side so that this can't be manipulated
  const tweets = await RecentTweets(session);

  return (
    <PageWrapper
      siteBackroundImage={
        <PageBackroundImage
          imgSrc={faucetBG}
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
      {/* @todo: UPDATE PAGEWRAPPER AND CONTAINER */}
      <PageContainer className="gap-8">
        <Typography variant="appPageHeading" className="text-center">
          Testnet Faucet
        </Typography>

        <AuthTwitter tweets={tweets} />
        <MintTokens tweets={tweets} />
        <AdditionalLinks />

        {/* @todo: Take footer out flex order */}
        <div>
          <Footer />
        </div>
      </PageContainer>
    </PageWrapper>
  );
}
