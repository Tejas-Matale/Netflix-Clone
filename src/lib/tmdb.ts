const TMDB_BASE = "https://api.themoviedb.org/3";

function buildUrlWithApiKey(path: string, apiKey: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${TMDB_BASE}${path}${separator}api_key=${encodeURIComponent(apiKey)}`;
}

export async function fetchTmdb<T>(path: string): Promise<T> {
  const rawKey = process.env.TMDB_API_KEY;
  if (!rawKey) throw new Error("TMDB_API_KEY not set");

  const isV4Token = rawKey.startsWith("ey");
  const url = isV4Token ? `${TMDB_BASE}${path}` : buildUrlWithApiKey(path, rawKey);

  const res = await fetch(url, {
    headers: isV4Token ? { Authorization: `Bearer ${rawKey}` } : undefined,
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB request failed: ${res.status}${body ? ` - ${body}` : ""}`);
  }
  return res.json();
}

export type TmdbListResult<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbMedia = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  media_type?: string;
};

