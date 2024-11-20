import { CHAIN_ID, CHAINS } from "@config/constants";
import { NextRequest, NextResponse } from "next/server";

import { cache } from "react";

const fetchInfura = async (
  id: number,
  jsonrpc: string,
  method: string,
  params: any[]
) => {
  const isGoerli = CHAINS[CHAIN_ID].chainName.toLowerCase() === "goerli";

  const res = await fetch(
    isGoerli
      ? "https://goerli.infura.io/v3/927668fc3dec43bcb1225299596c2e58"
      : "https://eth-mainnet.g.alchemy.com/v2/C1HA_ubz9iHEBkGZi-LxwHijrRHzRhUe",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, jsonrpc, method, params }),
      next: { revalidate: 12 },
    }
  );

  return res.json();
};

const fetchPublic = async (
  id: number,
  jsonrpc: string,
  method: string,
  params: any[]
) => {
  const res = await fetch(CHAINS[CHAIN_ID].rpcUrls[1], {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, jsonrpc, method, params }),
    next: { revalidate: 12 },
  });

  return res.json();
};

const fetchInfuraCached = cache(
  (jsonrpc: string, method: string, params: any[]) => {
    return fetchInfura(0, jsonrpc, method, params);
  }
);

const fetchPublicCached = cache(
  (jsonrpc: string, method: string, params: any[]) => {
    return fetchPublic(0, jsonrpc, method, params);
  }
);

const fetchInfuraCachedWithId = async (
  id: number,
  jsonrpc: string,
  method: string,
  params: any[]
) => {
  const res = await fetchInfuraCached(jsonrpc, method, params);

  return {
    id,
    ...res,
  };
};

const fetchPublicCachedWithId = async (
  id: number,
  jsonrpc: string,
  method: string,
  params: any[]
) => {
  const res = await fetchPublicCached(jsonrpc, method, params);

  return {
    id,
    ...res,
  };
};

// Return information on POST
export async function POST(request: NextRequest) {
  // extract req details and forward to infura
  const { id, jsonrpc, method, params } = (await request.json()) as {
    id: number;
    jsonrpc: string;
    method: string;
    params: any[];
  };

  if (method === "eth_getLogs") {
    // fetch from infura with cache
    return NextResponse.json(
      await fetchInfuraCachedWithId(id, jsonrpc, method, params),
      {
        headers: {
          "Cache-Control":
            "max-age=12, public, s-maxage=12, stale-while-revalidate=59",
        },
      }
    );
  }

  if (method === "eth_chainId") {
    // fetch from public with cache
    return NextResponse.json(
      await fetchPublicCachedWithId(id, jsonrpc, method, params),
      {
        headers: {
          "Cache-Control":
            "max-age=9999999999, public, s-maxage=9999999999, stale-while-revalidate=9999999999",
        },
      }
    );
  }

  // fetch from public node with no cache
  return NextResponse.json(await fetchInfura(id, jsonrpc, method, params), {
    headers: {
      "Cache-Control":
        "max-age=12, public, s-maxage=12, stale-while-revalidate=59",
    },
  });
}
