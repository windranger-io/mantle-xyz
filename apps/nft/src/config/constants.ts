// Configure the applications name
export const APP_NAME =
  "Mantle: Unveiled | The gateway to Mantle will open soon.";

// Configure deta description
export const META =
  "A new journey awaits. Enter into an ecosystem filled with never ending rainforest, rich minerals and gemstones, and adventure around every corner. ";

// Configure OG Title
export const OG_TITLE = "The Gateway to Mantle Will Open Soon";

// Configure OG Desc
export const OG_DESC =
  "Get ready to enter into Mantle's adventure filled ecosystem.";

// Configure Twiiter Title
export const TWITTER_TITLE = "The Gateway to Mantle Will Open Soon";

// Configure Twiiter Desc
export const TWITTER_DESC =
  "Get ready to enter into Mantle's adventure filled ecosystem.";

// To be changed before launch
export const ABSOLUTE_PATH =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://mint.mantle.xyz/"
    : process.env.NEXT_PUBLIC_VERCEL_URL;

// Google Tag
export const GOOGLE_TAG = "GTM-PX2HN6L";

// everything by default
export default {
  APP_NAME,
};
