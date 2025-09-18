import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { put, list } from "@vercel/blob";

export const dynamic = "force-dynamic";

// ---- config ----
const ALLOWED_REPOS = process.env.GITHUB_ALLOWED_REPOS?.split(",") ?? [];
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

// ---- utils ----

// get repo config from ENV
function getRepoConfig(repoKey: string) {
  const envKey = repoKey.replace(/[-/]/g, "_").toUpperCase();
  return {
    branch: process.env[`GITHUB_BRANCH_${envKey}`] ?? "main",
    jsonPath: process.env[`GITHUB_JSON_PATH_${envKey}`] ?? "delegates.json",
    secret: process.env[`GITHUB_SECRET_${envKey}`],
  };
}

// fetch data from GitHub API (better than raw.githubusercontent - less cache)
async function fetchFromGitHubRaw(
  owner: string,
  repo: string,
  path: string,
  branch = "main"
): Promise<any> {
  // Use GitHub API instead of raw URL to avoid cache issues
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "mantle-delegation-webhook",
  };

  // Add GitHub token if available for higher rate limits
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(
      `GitHub API error: ${res.status} ${res.statusText} - Cannot find ${owner}/${repo}/${branch}/${path}`
    );
  }

  const data = await res.json();

  // GitHub API returns base64 encoded content
  if (data.encoding === "base64" && data.content) {
    const decodedContent = Buffer.from(data.content, "base64").toString(
      "utf-8"
    );
    return JSON.parse(decodedContent);
  }

  throw new Error(
    `Unexpected GitHub API response format for ${owner}/${repo}/${path}`
  );
}

// verify GitHub webhook signature
function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;
  try {
    return crypto.timingSafeEqual(
      new Uint8Array(Buffer.from(signature)),
      new Uint8Array(Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

// extract repoKey
function extractRepoKey(payload: any): string | null {
  return payload?.repository?.full_name ?? null;
}

// get current block number
async function getCurrentBlockNumber(): Promise<number> {
  const rpcUrl = process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz";

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    return parseInt(data.result, 16); // 十六进制转十进制
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("⚠️ Failed to get block number, using timestamp:", error);
    // 如果获取失败，使用时间戳作为fallback
    return Math.floor(Date.now() / 1000);
  }
}

// merge all latest.json into merged-latest.json
async function mergeAllRepos(
  updatedRepoKey: string,
  updatedUrl: string,
  updatedData: any
) {
  const delegationData: Record<string, any[]> = {};

  // get current block number
  const blockNumber = await getCurrentBlockNumber();

  // add updated repo to delegationData
  const mergedKey = updatedRepoKey.toUpperCase().replace(/[-/]/g, "_");
  delegationData[mergedKey] = updatedData;

  // get all latest.json files
  const { blobs } = await list({ token: BLOB_TOKEN });
  const otherFiles = blobs.filter(
    (b) =>
      b.pathname.endsWith("latest.json") &&
      b.pathname !== "merged-latest.json" &&
      b.pathname !== `${updatedRepoKey}/latest.json`
  );

  // eslint-disable-next-line no-console
  console.log(
    `🔍 Found ${otherFiles.length} latest.json files:`,
    otherFiles.map((b) => b.pathname)
  );

  await Promise.all(
    otherFiles.map(async (blob) => {
      try {
        const res = await fetch(blob.url);

        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error(`❌ Failed to fetch ${blob.pathname}: ${res.status}`);
          return;
        }
        const data = await res.json();
        const repoKey = blob.pathname.replace("/latest.json", "");
        const repoMergedKey = repoKey.toUpperCase().replace(/[-/]/g, "_");

        // eslint-disable-next-line no-console
        console.log(`📄 Processing ${blob.pathname} -> ${repoMergedKey}`);

        delegationData[repoMergedKey] = data;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`❌ Failed to load ${blob.pathname}`, err);
      }
    })
  );

  const merged = {
    metadata: {
      blockNumber,
      timestamp: new Date().toISOString(),
      totalRepos: Object.keys(delegationData).length,
    },
    data: delegationData,
  };

  // save merged-latest.json to blob
  await put("merged-latest.json", JSON.stringify(merged, null, 2), {
    access: "public",
    token: BLOB_TOKEN,
    allowOverwrite: true,
    cacheControlMaxAge: 300,
  });

  // save snapshot to blob
  await put(
    `merged-block-${blockNumber}.json`,
    JSON.stringify(merged, null, 2),
    {
      access: "public",
      token: BLOB_TOKEN,
    }
  );

  return { count: Object.keys(merged).length, blockNumber };
}

// ---- routes ----
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    const repoKey = extractRepoKey(payload);
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const event = request.headers.get("x-github-event");

    if (!repoKey || !ALLOWED_REPOS.includes(repoKey)) {
      return NextResponse.json(
        { success: false, error: "Repo not allowed", repo: repoKey },
        { status: 403 }
      );
    }

    const { branch, jsonPath, secret } = getRepoConfig(repoKey);
    if (!secret) {
      return NextResponse.json(
        { success: false, error: `Missing secret for ${repoKey}` },
        { status: 500 }
      );
    }

    if (!verifyGitHubSignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    if (event !== "push" && event !== "ping") {
      return NextResponse.json({
        success: true,
        message: `Event ${event} ignored`,
        repo: repoKey,
      });
    }

    const [owner, repo] = repoKey.split("/");
    const data = await fetchFromGitHubRaw(owner, repo, jsonPath, branch);

    // save repo latest.json
    const result = await put(
      `${repoKey}/latest.json`,
      JSON.stringify(data, null, 2),
      {
        access: "public",
        token: BLOB_TOKEN,
        allowOverwrite: true,
        cacheControlMaxAge: 60, // 1 minute
      }
    );

    // eslint-disable-next-line no-console
    console.log("🔒 Saved repo latest.json to blob:", result.url);

    // update merged-latest.json
    const { count, blockNumber } = await mergeAllRepos(
      repoKey,
      result.url,
      data
    );

    return NextResponse.json({
      success: true,
      repo: repoKey,
      event,
      reposMerged: count,
      blockNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "GitHub webhook active",
    allowedRepos: ALLOWED_REPOS,
    timestamp: new Date().toISOString(),
  });
}
