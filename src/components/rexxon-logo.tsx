import { cn } from "@/lib/utils";
import logoFull from "@/assets/rexxon-logo-full.png";

type Size = "sm" | "md" | "lg";

// White wordmark on a transparent background — sized by height so it blends
// into any dark surface (sidebar, footer, nav) without a visible container.
const SIZES: Record<Size, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
};

/**
 * Rexxon AI logo — white wordmark, transparent background. Drops into dark
 * UI surfaces and inherits the parent's background seamlessly.
 */
export function RexxonLogo({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <img
      src={logoFull}
      alt="Rexxon AI"
      className={cn("w-auto object-contain", SIZES[size], className)}
      draggable={false}
    />
  );
}

/**
 * Wordmark variant — alias of RexxonLogo since the full logo already
 * contains the brand name. Kept for backward compatibility.
 */
export function RexxonWordmark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return <RexxonLogo size={size} className={className} />;
}
