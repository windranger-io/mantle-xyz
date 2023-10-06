import { getBaseUrl } from "@config/constants";
import { useEffect, useState } from "react";
import { useQuery } from "wagmi";

export default function useGeolocationCheck() {
  const url = `${getBaseUrl()}/api/geolocation`;

  const [isClient, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);

  const query = useQuery(
    ["GEOLOCATION"],
    async () => {
      try {
        const data = await fetch(url);
        const res = await data.json();
        return res;
      } catch (e) {
        return {};
      }
    },
    {
      refetchInterval: false,
      retry: false,
      enabled: isClient,
    }
  );

  return {
    isLoading: query.isLoading,
    isRestricted: query.data?.isRestricted,
  };
}
