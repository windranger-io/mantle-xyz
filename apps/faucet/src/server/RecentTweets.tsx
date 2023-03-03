import { Session } from "next-auth";
import Client from "twitter-api-sdk";

export default async function RecentTweets(session: Session) {
  if (session && session.user) {
    try {
      // use access_token from session token
      const client = new Client(session.user.access_token);
      // collect 10 most recent tweets
      const recentTweets = (await client.tweets.tweetsRecentSearch({
        query: `(from:${session.user.username}) -is:retweet`,
        sort_order: "recency",
        max_results: 10,
      })) as unknown as {
        data: {
          id: string;
          text: string;
        }[];
      };

      // return the tweets
      return (recentTweets.data || []).map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
      }));
    } catch {
      // whatever the error ignore it
      return [];
    }
  }

  return [];
}
