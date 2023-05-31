import Decimal from "decimal.js";

export const formatBigNumberString = (
  str: string,
  precision = 6,
  locale = "en"
) => {
  let integerPart = BigInt(str.split(".")[0] || 0);
  let fractionPart = new Decimal(`0.${str?.split(".")?.[1] || 0}`)
    .toFixed(precision)
    .toString()
    .replace(/^0|0+$/g, "")
    .replace(/^([^0-9])$/, "$10");

  // if the fraction part rolls over we need to apply to integerPart
  if (parseFloat(fractionPart) >= 1) {
    integerPart += BigInt(1);
    fractionPart = fractionPart.replace(/^1/, "");
  }

  // format according to the given locale
  const mainFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
  });

  // construct a template to pull locales decimal seperator
  const template = mainFormat.format(1.1);

  // reconnect the number parts and place templates seperator
  return `${mainFormat.format(integerPart)}${template[1]}${mainFormat
    .format(
      parseInt(
        (fractionPart.length === 1 ? `${fractionPart}0` : fractionPart)
          .split("")
          .reverse()
          .join(""),
        10
      )
    )
    .split("")
    .reverse()
    .join("")}`;
};

export const truncateAddress = (address: `0x${string}`) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
