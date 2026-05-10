import * as React from "react";
import { cn } from "./cn";

type SectionTone = "light" | "parchment" | "dark";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: SectionTone;
  bleed?: boolean;
};

const toneClasses: Record<SectionTone, string> = {
  light: "bg-[var(--color-canvas)] text-[var(--color-ink)]",
  parchment: "bg-[var(--color-canvas-parchment)] text-[var(--color-ink)]",
  dark: "bg-[var(--color-surface-tile-1)] text-[var(--color-body-on-dark)]",
};

export function Section({
  className,
  tone = "light",
  bleed = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("w-full py-12 md:py-20", toneClasses[tone], className)} {...props}>
      <div className={cn(!bleed && "content-lock px-6 md:px-10")}>{children}</div>
    </section>
  );
}
