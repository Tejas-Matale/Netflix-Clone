import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { autoplayNext, autoplayPreviews, language } = body as {
      autoplayNext?: boolean;
      autoplayPreviews?: boolean;
      language?: string;
    };

    let profile = await prisma.profile.findFirst({ where: { userId: session.user.id } });
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          name: "Primary",
          avatarColor: "red",
          isKids: false,
          ...(autoplayNext !== undefined ? { autoplayNext } : {}),
          ...(autoplayPreviews !== undefined ? { autoplayPreviews } : {}),
          ...(language ? { language } : {}),
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          ...(autoplayNext !== undefined ? { autoplayNext } : {}),
          ...(autoplayPreviews !== undefined ? { autoplayPreviews } : {}),
          ...(language ? { language } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true, profile });
  } catch (e: unknown) {
    console.error("/api/profile PATCH error", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 