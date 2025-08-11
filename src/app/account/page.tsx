import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import SignOutButton from "@/components/sign-out-button";
import AccountPreferences from "@/components/account-preferences";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-gray-400">You need to sign in to view this page.</p>
        </div>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: true,
      profiles: { take: 1 },
    },
  });
  const { name, email, image } = session.user;
  const profile = user?.profiles?.[0] || { autoplayNext: true, autoplayPreviews: true, language: "en" };
  const favoritesCount = user?.favorites?.length ?? 0;

  return (
    <main className="min-h-dvh p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Account</h1>

      <section className="flex items-center gap-4 bg-neutral-900/60 p-4 rounded">
        <div className="relative w-16 h-16 rounded overflow-hidden bg-neutral-800">
          {image ? (
            <Image src={image} alt={name ?? email ?? "User"} fill sizes="64px" className="object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400">{(name ?? email ?? "U").slice(0, 1)}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium">{name ?? "Unnamed user"}</div>
          <div className="text-sm text-gray-400">{email}</div>
        </div>
        <SignOutButton className="text-sm text-gray-300 hover:underline" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="bg-neutral-900/60 p-4 rounded">
          <h2 className="font-semibold mb-2">Plan</h2>
          <p className="text-gray-300 text-sm">Basic (Demo)</p>
          <p className="text-gray-500 text-xs mt-1">Upgrade and billing settings would appear here.</p>
        </div>
        <div className="bg-neutral-900/60 p-4 rounded">
          <h2 className="font-semibold mb-2">My List</h2>
          <p className="text-gray-300 text-sm">Saved titles: {favoritesCount}</p>
          <Link href="/my-list" className="text-sm text-red-400 hover:text-red-300 mt-1 inline-block">View My List →</Link>
        </div>
      </section>

      <section className="bg-neutral-900/60 p-4 rounded">
        <h2 className="font-semibold mb-4">Playback & Language</h2>
        <AccountPreferences initial={{
          autoplayNext: Boolean(profile.autoplayNext ?? true),
          autoplayPreviews: Boolean(profile.autoplayPreviews ?? true),
          language: profile.language ?? "en",
        }} />
      </section>

      <section className="bg-neutral-900/60 p-4 rounded">
        <h2 className="font-semibold mb-2">Security</h2>
        <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
          <li>Email sign-in with password</li>
          <li>Google OAuth connected (if used)</li>
          <li>Sign out of all devices (coming soon)</li>
        </ul>
      </section>
    </main>
  );
}

