import { cn } from "@/lib/utils";
import logoFull from "@/assets/rexxon-logo-full.webp";

type Size = "sm" | "md" | "lg";

// Full horizontal logo (wordmark + brain icon). Width-driven sizing keeps
// the natural aspect ratio of the source image (~1500x640).
const SIZES: Record<Size, string> = {
  sm: "h-[180px] w-[750px] max-w-full",
  md: "h-[240px] w-[1000px] max-w-full",
  lg: "h-[320px] w-[1300px] max-w-full",
};

/**
 * Rexxon AI logo — full horizontal lockup used across nav bars, footer,
 * marketing pages, and email headers.
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
      className={cn("shrink-0 object-contain", SIZES[size], className)}
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
