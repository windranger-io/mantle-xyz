// Dummy components
import { Page as PageWrapper, Container } from "@mantle/ui";

// Page components
import AuthTwitter from "@components/AuthTwtitter";
import ConnectWallet from "@components/ConnectWallet";
import MintTokens from "@components/MintTokens";

// Server-side components
import RecentTweets from "@server/RecentTweets";

// Extract session from caller
import { headers } from "next/headers";
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
    <div className="text-white">
      <PageWrapper>
        <Container className="pb-8">
          <h1 className="text-6xl font-bold text-white">Mantle Faucet</h1>
          {/* @todo: Components need to be styled */}
          <ConnectWallet />
          <AuthTwitter tweets={tweets} />
          <MintTokens tweets={tweets} />
        </Container>
        <footer className="flex h-24 w-full items-center justify-center border-t text-gray-50">
          Powered by BIT
        </footer>
      </PageWrapper>
    </div>
  );
}
