import { cn } from "@/lib/utils";
import logoFull from "@/assets/rexxon-logo-full.png";

type Size = "sm" | "md" | "lg";

// White wordmark — halved from previous size and made responsive: smaller
// on mobile, scaling up on larger screens to stay legible without dominating.
const SIZES: Record<Size, string> = {
  sm: "h-10 sm:h-12 md:h-16",
  md: "h-12 sm:h-16 md:h-20",
  lg: "h-16 sm:h-20 md:h-28",
};

// Layered drop-shadow creates a soft halo/glow behind the wordmark.
const SHADOW =
  "drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] drop-shadow-[0_0_24px_rgba(139,92,246,0.35)]";

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
      className={cn("w-auto object-contain", SIZES[size], SHADOW, className)}
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
