"use client";

import Decimal from "decimal.js";

export const localeZero = new Intl.NumberFormat(
  globalThis.navigator?.language || "en",
  {
    minimumFractionDigits: 1,
  }
).format(Number("0.0"));

export const formatBigNumberString = (
  str: string,
  precision = 6,
  groupingInt = true,
  groupingFrac = true,
  locale = globalThis.navigator?.language || "en"
) => {
  const integerPart = BigInt(str.split(".")[0] || 0);
  const fractionPart = new Decimal(
    `0.${str?.split(".")?.[1]?.slice(0, precision) || 0}`
  )
    .toFixed(precision)
    .toString()
    .replace(/^0|0+$/g, "")
    .replace(/^([^0-9])$/, "$10");

  // format according to the given locale
  const mainFormatInt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    useGrouping: groupingInt,
  });
  // format according to the given locale
  const mainFormatFrac = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    useGrouping: groupingFrac,
  });

  // construct a template to pull locales decimal seperator
  const template = mainFormatInt.format(1.1);

  // reconnect the number parts and place templates seperator
  return `${mainFormatInt.format(integerPart)}${template[1]}${mainFormatFrac
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
