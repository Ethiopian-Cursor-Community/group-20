import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Material Design 3 filled text field.
 *
 *   ┌──────────────┐   ← rounded top (12px)
 *   │   Input      │   ← muted (surface-container-low) fill
 *   └──────────────┘   ← square bottom with 2px outline → primary on focus
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-14 w-full rounded-t-md rounded-b-none border-0 border-b-2 border-md-outline bg-muted px-4 pt-4 pb-2 text-base text-foreground transition-colors duration-200 ease-md placeholder:text-md-on-surface-variant/70 focus-visible:outline-none focus-visible:border-primary focus-visible:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
