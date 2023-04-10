// Dummy components
import { Header, Footer, PageWrapper, PageBackroundImage } from "@mantle/ui";
// Page components
import AuthTwitter from "@components/AuthTwtitter";
import ConnectWallet from "@components/ConnectWallet";
import MintTokens from "@components/MintTokens";

// Server-side components
import RecentTweets from "@server/RecentTweets";

// Extract session from caller
import { headers } from "next/headers";
import faucetBG from "../../public/faucet-bg.png";
import { getSession } from "./session";

/**
 *
 * @todo Updated with real components and content when ready
 */
export default async function Page() {
  // * [Passing data between a parent layout and its children is not possible.
  //   However, you can fetch the same data in a route more than once, and React
  //   will automatically dedupe the requests without affecting performance.]
  //   (https://beta.nextjs.org/docs/routing/pages-and-layouts)
  const session = await getSession(headers().get("cookie") ?? "");
  // get the tweets server-side so that this can't be manipulated
  const tweets = await RecentTweets(session);

  return (
    <div>
      <PageBackroundImage imgSrc={faucetBG} altDesc="Faucet Background Image" />
      <Header>
        <ConnectWallet />
      </Header>
      {/* @todo: UPDATE PAGEWRAPPER AND CONTAINER */}

      <div className="flex flex-col justify-center min-h-[calc(100vh-68px)] ">
        <PageWrapper className="gap-8">
          <h1 className="text-5xl text-white text-center font-sansSemiBold">
            Testnet Faucet
          </h1>

          <AuthTwitter tweets={tweets} />
          <MintTokens tweets={tweets} />
        </PageWrapper>

        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
