"use client";
import { useEffect, useState } from "react";

type ToastType = { id: number; message: string; type?: "success" | "error" | "info" };

export default function ToastHub() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    let idCounter = 1;
    function onToast(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      const toast: ToastType = { id: idCounter++, message: String(detail.message || detail), type: detail.type };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, detail.timeout ?? 3000);
    }
    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto min-w-[200px] max-w-[320px] rounded-md px-4 py-3 shadow-xl border text-sm ${
            t.type === "error" ? "bg-red-900/70 border-red-700 text-red-100" : t.type === "success" ? "bg-green-900/60 border-green-700 text-green-100" : "bg-neutral-900/80 border-neutral-700 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
} 