import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-stone-700 text-stone-200",
  open: "bg-emerald-900/60 text-emerald-300 border border-emerald-700",
  hidden: "bg-stone-800 text-stone-500 border border-stone-600",
  used: "bg-amber-900/50 text-amber-400 border border-amber-700",
  eliminated: "bg-red-900/50 text-red-300 border border-red-800",
  host: "bg-amber-800/60 text-amber-200 border border-amber-600",
  ready: "bg-emerald-800/40 text-emerald-200",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
