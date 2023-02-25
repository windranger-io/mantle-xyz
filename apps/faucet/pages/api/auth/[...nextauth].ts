// @TODO - look to migrate this to appDir as a route.ts file (app/api/auth/[...nextauth]/route.ts)
//       - blocked by https://github.com/nextauthjs/next-auth/issues/6792#issuecomment-1446888152

import NextAuth, { NextAuthOptions, Profile, Session } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

// Profile type returned via JWT callback
type TwitterProfile = Profile & {
  data: {
    name: string;
    profile_image_url: string;
    id: string;
    username: string;
  };
};

// Twitter user as defined in the session
type TwitterUser = {
  username: string;
  access_token: string;
};

// Expose next auth...
export const authOptions: NextAuthOptions & { site: string } = {
  // share a secret to encrypt session
  secret: process.env.NEXTAUTH_SECRET,
  // Pass the site to set callback root
  site: process.env.NEXTAUTH_URL!,
  // Configure one or more authentication providers
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_ID!,
      clientSecret: process.env.TWITTER_SECRET!,
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // current user in the token state
      const tokenUser = token?.user as TwitterUser;

      // new user in state change...
      const username = (profile as TwitterProfile)?.data?.username;
      const accessToken = account?.access_token;

      // add user to token...
      return {
        ...token,
        // need access_token to call api on users behalf and username to identify them
        user: {
          // if logged in the username will be contained in the profiles data prop
          username: username || tokenUser?.username,
          // access_token is pulled from the account (we use this to connect to twitter-api-sdk)
          access_token: accessToken || tokenUser?.access_token,
        },
      };
    },
    async session({ session: data, token }) {
      // Send properties to the client, like an access_token from a provider.
      const session: Session = { ...data };
      // set the users details in to the session
      session.user = token.user as TwitterUser;

      return session;
    },
  },
};

export default NextAuth(authOptions);
