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
      (fractionPart.length === 1 ? `${fractionPart}0` : fractionPart)
        .split("")
        .reverse()
        .join("") as unknown as number
    )
    .split("")
    .reverse()
    .join("")}`;
};

export const truncateAddress = (address: `0x${string}`) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

// format a given time into a nice representation
export const formatTime = (
  seconds: number,
  shortHand: boolean = false
): string => {
  const WEEK_SECONDS = 604800;
  const DAY_SECONDS = 86400;
  const HOUR_SECONDS = 3600;
  const MINUTE_SECONDS = 60;

  // check if amount of seconds exceeds markers
  if (seconds >= WEEK_SECONDS) {
    const weeks = Math.floor(seconds / WEEK_SECONDS);
    return `${weeks} ${shortHand ? "wk" : "week"}${weeks > 1 ? "s" : ""}`;
  }
  if (seconds >= DAY_SECONDS) {
    const days = Math.floor(seconds / DAY_SECONDS);
    return `${days} ${shortHand ? "dy" : "day"}${days > 1 ? "s" : ""}`;
  }
  if (seconds >= HOUR_SECONDS) {
    const hours = Math.floor(seconds / HOUR_SECONDS);
    return `${hours} ${shortHand ? "hr" : "hour"}${hours > 1 ? "s" : ""}`;
  }
  if (seconds >= MINUTE_SECONDS) {
    const minutes = Math.floor(seconds / MINUTE_SECONDS);
    return `${minutes} ${shortHand ? "min" : "minute"}${
      minutes > 1 ? "s" : ""
    }`;
  }
  return `${seconds} ${shortHand ? "sec" : "second"}${seconds > 1 ? "s" : ""}`;
};
