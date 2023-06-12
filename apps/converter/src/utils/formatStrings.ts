import Decimal from "decimal.js";

export const formatBigNumberString = (
  str: string,
  precision = 6,
  useGrouping = true,
  locale = "en"
) => {
  // format according to the given locale
  const mainFormat = new Intl.NumberFormat(locale, {
    useGrouping,
    minimumFractionDigits: 0,
  });

  // construct a template to pull locales decimal seperator
  const template = mainFormat.format(1.1);

  // extract the details from the value
  const integerPart = BigInt(str.split(".")[0] || 0);
  const fractionPart = new Decimal(`0.${str?.split(".")?.[1] || 0}`)
    .toFixed(precision)
    .toString()
    // remove first 0 and repeated 00's at the end
    .replace(/^0|0+$/g, "")
    // match the decimal and place a 0 if decimals are absent
    .replace(/^(\.)$/, ".0")
    // remove the decimal so we're just left with the decimal component
    .replace(/^./, "");

  // construct the string with 2 bns (using BNs should prevent overflows and maintain strict precision) and the template seperator
  return `${mainFormat.format(integerPart)}${
    fractionPart !== "0"
      ? `${template[1]}${mainFormat
          // format with gouping in reverse to position thsd seperators correctly
          .format(BigInt(fractionPart.split("").reverse().join("")))
          // return oiriginal position post-formatting
          .split("")
          .reverse()
          .join("")}`
      : ``
  }`;
};

export const truncateAddress = (address: `0x${string}`) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
