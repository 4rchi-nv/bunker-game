"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DiscussionTimer({
  endsAt,
  className,
}: {
  endsAt: number | null;
  className?: string;
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setSeconds(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt) return null;

  const urgent = seconds < 60;

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-2 text-center font-mono text-2xl font-bold",
        urgent
          ? "border-red-600 bg-red-950/50 text-red-300 animate-pulse"
          : "border-amber-700 bg-amber-950/30 text-amber-300",
        className
      )}
    >
      {formatTime(seconds)}
    </div>
  );
}
