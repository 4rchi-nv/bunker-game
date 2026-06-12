import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-stone-600 bg-stone-950 px-3 py-2 text-base text-stone-100 placeholder:text-stone-500 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
