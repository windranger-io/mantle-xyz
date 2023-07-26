"use client";

export const localeZero = new Intl.NumberFormat(
  globalThis.navigator?.language || "en",
  {
    minimumFractionDigits: 1,
  }
).format(Number("0.0"));

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
