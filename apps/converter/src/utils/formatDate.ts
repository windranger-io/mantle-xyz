const localDateTimeIntl = new Intl.DateTimeFormat(
  globalThis.navigator?.language || "en",
  {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hour12: true,
    timeZoneName: "short",
  }
);

export const getLocalDateTime = (date: number | Date | undefined) => {
  const formattedDateTime = localDateTimeIntl.format(date);

  // Extracting the date and time components
  const [datePart, timePart] = formattedDateTime.split(",");

  // Transforming the date part into the desired format (YYYY-MM-DD)
  const [month, day, year] = datePart.split("/");
  const formattedDate = `${year}-${month}-${day}`;

  return `${formattedDate} ${timePart}`;
};
