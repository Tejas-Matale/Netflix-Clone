import { NextRequest } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "/trending/all/week";
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "TMDB_API_KEY not set" }), { status: 500 });
  }

  const tmdbUrl = new URL(`${TMDB_BASE}${path}`);
  // Forward all params except `path`
  url.searchParams.forEach((value, key) => {
    if (key !== "path") tmdbUrl.searchParams.set(key, value);
  });
  if (!tmdbUrl.searchParams.has("language")) tmdbUrl.searchParams.set("language", "en-US");

  const isV4 = apiKey.startsWith("ey");
  if (!isV4) {
    tmdbUrl.searchParams.set("api_key", apiKey);
  }

  const res = await fetch(tmdbUrl.toString(), {
    headers: isV4 ? { Authorization: `Bearer ${apiKey}` } : undefined,
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

