import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ favorites: [] }, { status: 200 });

    const { searchParams } = new URL(req.url);
    const tmdbIdParam = searchParams.get("tmdbId");
    const mediaType = searchParams.get("mediaType") as "movie" | "tv" | null;

    if (tmdbIdParam && mediaType) {
      const tmdbId = Number(tmdbIdParam);
      if (!Number.isFinite(tmdbId)) return NextResponse.json({ exists: false });
      const found = await prisma.favorite.findFirst({
        where: { userId: session.user.id, tmdbId, mediaType },
        select: { id: true },
      });
      return NextResponse.json({ exists: Boolean(found) });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ favorites });
  } catch (e: unknown) {
    console.error("/api/favorites GET error", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ favorites: [], error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    const { tmdbId, mediaType, title, posterPath } = body as {
      tmdbId: number;
      mediaType: "movie" | "tv";
      title: string;
      posterPath?: string | null;
    };
    if (!tmdbId || !mediaType || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.favorite.findFirst({
      where: { userId: session.user.id, tmdbId, mediaType },
    });
    const favorite = existing
      ? await prisma.favorite.update({
          where: { id: existing.id },
          data: { title, posterPath: posterPath ?? null },
        })
      : await prisma.favorite.create({
          data: {
            userId: session.user.id,
            tmdbId,
            mediaType,
            title,
            posterPath: posterPath ?? null,
          },
        });
    return NextResponse.json({ ok: true, favorite });
  } catch (e: unknown) {
    console.error("/api/favorites POST error", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => null);
    const { tmdbId, mediaType } = (body || {}) as { tmdbId?: number; mediaType?: "movie" | "tv" };
    if (!tmdbId || !mediaType) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const existing = await prisma.favorite.findFirst({
      where: { userId: session.user.id, tmdbId, mediaType },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ ok: true });
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("/api/favorites DELETE error", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 