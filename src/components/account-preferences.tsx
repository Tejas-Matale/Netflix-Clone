"use client";
import { useState, useTransition } from "react";

type Props = {
  initial: { autoplayNext?: boolean; autoplayPreviews?: boolean; language?: string };
};

export default function AccountPreferences({ initial }: Props) {
  const [autoplayNext, setAutoplayNext] = useState<boolean>(initial.autoplayNext ?? true);
  const [autoplayPreviews, setAutoplayPreviews] = useState<boolean>(initial.autoplayPreviews ?? true);
  const [language, setLanguage] = useState<string>(initial.language ?? "en");
  const [saving, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function save(partial?: Partial<{ autoplayNext: boolean; autoplayPreviews: boolean; language: string }>) {
    setErr(null);
    setOk(null);
    const payload = {
      autoplayNext,
      autoplayPreviews,
      language,
      ...partial,
    };
    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        try {
          const j = await res.json();
          setErr(j?.error || "Failed to save");
        } catch {
          setErr("Failed to save");
        }
        return;
      }
      setOk("Preferences saved");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoplayNext}
            onChange={(e) => {
              setAutoplayNext(e.target.checked);
              save({ autoplayNext: e.target.checked });
            }}
          />
          Autoplay next episode
        </label>
        <span className="text-xs text-gray-500">{saving ? "Saving..." : autoplayNext ? "On" : "Off"}</span>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoplayPreviews}
            onChange={(e) => {
              setAutoplayPreviews(e.target.checked);
              save({ autoplayPreviews: e.target.checked });
            }}
          />
          Autoplay previews
        </label>
        <span className="text-xs text-gray-500">{saving ? "Saving..." : autoplayPreviews ? "On" : "Off"}</span>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm">Language</label>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            save({ language: e.target.value });
          }}
          className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded px-2 py-1"
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
      {err && <div className="text-xs text-red-400">{err}</div>}
      {ok && <div className="text-xs text-green-400">{ok}</div>}
    </div>
  );
} 