import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

  const db = prisma;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ items: [] });
  const items = await db.history.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { tmdbId, mediaType, title, posterPath, season, episode } = body as {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    season?: number | null;
    episode?: number | null;
  };
  if (!tmdbId || !mediaType || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await db.history.findFirst({ where: { userId: session.user.id, tmdbId, mediaType, season: season ?? undefined, episode: episode ?? undefined } });
  const record = existing
    ? await db.history.update({ where: { id: existing.id }, data: { title, posterPath: posterPath ?? undefined, updatedAt: new Date() } })
    : await db.history.create({ data: { userId: session.user.id, tmdbId, mediaType, title, posterPath: posterPath ?? undefined, season: season ?? undefined, episode: episode ?? undefined } });
  return NextResponse.json({ ok: true, item: record });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { tmdbId, mediaType, season, episode, positionMs, durationMs, deltaMs } = body as {
    tmdbId: number;
    mediaType: "movie" | "tv";
    season?: number | null;
    episode?: number | null;
    positionMs?: number;
    durationMs?: number;
    deltaMs?: number;
  };
  if (!tmdbId || !mediaType) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Using 'as any' here because Prisma types are strict but we need flexible query parameters
  const where = { userId: session.user.id, tmdbId, mediaType, season: season ?? undefined, episode: episode ?? undefined } as any;
  const existing = await db.history.findFirst({ where });
  if (!existing) {
    const created = await db.history.create({ data: { ...where, positionMs: Math.max(0, positionMs || 0), durationMs: durationMs ?? null } });
    return NextResponse.json({ ok: true, item: created });
  }
  let nextPos = existing.positionMs || 0;
  if (typeof deltaMs === "number") nextPos += deltaMs;
  if (typeof positionMs === "number") nextPos = positionMs;
  if (nextPos < 0) nextPos = 0;
  let dur = typeof durationMs === "number" ? durationMs : existing.durationMs || null;
  if (dur && nextPos > dur) nextPos = dur;

  const updated = await db.history.update({
    where: { id: existing.id },
    data: {
      positionMs: nextPos,
      ...(dur ? { durationMs: dur } : {}),
      updatedAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, item: updated });
} 