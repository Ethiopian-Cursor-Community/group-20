import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-t-md rounded-b-none border-0 border-b-2 border-md-outline bg-muted px-4 pt-4 pb-3 text-base text-foreground transition-colors duration-200 ease-md placeholder:text-md-on-surface-variant/70 focus-visible:outline-none focus-visible:border-primary focus-visible:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
