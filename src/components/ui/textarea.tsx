import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-lg border border-stone-600 bg-stone-950 px-3 py-2 text-base text-stone-100 placeholder:text-stone-500 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
