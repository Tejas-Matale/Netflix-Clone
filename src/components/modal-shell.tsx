"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  function close() {
    router.back();
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={close}>
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-auto rounded-lg bg-neutral-950 border border-neutral-800" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" onClick={close} className="absolute top-3 right-3 text-white/80 hover:text-white">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
} 