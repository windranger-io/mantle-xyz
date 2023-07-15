// make a claim against the production-faucet
export const claim = async (reservedFor: string) => {
  // append the claim to the queue
  return fetch(
    `${(process.env.PRODUCTION_FAUCET_URL || "").replace(
      /\/$/,
      ""
    )}/claim/create`,
    {
      method: "POST",
      // attach auth headers to request
      headers: new Headers({
        "auth-key": process.env.PRODUCTION_FAUCET_KEY || "",
        "Content-Type": "application/json",
      }),
      // attempt a new claim for this user
      body: JSON.stringify({
        // strategy ID for the faucet
        strategyId:
          process.env.PRODUCTION_FAUCET_STRATEGY || "64a4030a17d32f867b5270a3",
        // recipient of the gas-drop
        reservedFor,
      }),
      redirect: "follow" as RequestRedirect,
    }
  ).then((response) => response.json());
};
