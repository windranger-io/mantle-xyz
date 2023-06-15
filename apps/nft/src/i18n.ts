import { getRequestConfig } from "next-intl/server";
import CONST from "@mantle/constants";

const { I18NEXUS_API_URL, I18NEXUS_API_KEY, I18NEXUS_PRE_BUILD } = process.env;

const getMessages = async (locale: string) => {
  const NEXUS_LIVE_URL = `${I18NEXUS_API_URL}/translations.json?api_key=${I18NEXUS_API_KEY}`;

  /**
   * Check if we want to use the prebuilt translations
   */
  if (I18NEXUS_PRE_BUILD === "true") {
    const nameSpaces = CONST.TRANSLATION.NAMESPACES;
    const response = await Promise.all(
      nameSpaces.map(async (index, key) => ({
        [nameSpaces[key]]: (
          await import(`./i18n/${locale}/${nameSpaces[key]}.json`)
        ).default,
      }))
    );

    return Object.assign(
      {},
      ...response.map((item, index) => ({
        [nameSpaces[index]]: item[nameSpaces[index]],
      }))
    );
  }

  /**
   * Otherwise use the latest live versions from i18nexus
   */
  const response = await fetch(NEXUS_LIVE_URL);
  const json = await response.json();
  return json[locale];
};

export default getRequestConfig(async ({ locale }) => ({
  messages: await getMessages(locale),
}));
