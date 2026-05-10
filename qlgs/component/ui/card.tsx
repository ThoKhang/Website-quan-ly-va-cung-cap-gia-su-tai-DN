import * as React from "react";
import { cn } from "./cn";

type CardTone = "light" | "parchment" | "dark";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

const toneClasses: Record<CardTone, string> = {
  light: "surface-card bg-[var(--color-canvas)] text-[var(--color-ink)]",
  parchment: "surface-card bg-[var(--color-canvas-parchment)] text-[var(--color-ink)]",
  dark:
    "rounded-[var(--radius-lg)] border border-white/10 bg-[var(--color-surface-tile-1)] text-[var(--color-body-on-dark)]",
};

export function Card({ className, tone = "light", ...props }: CardProps) {
  return <div className={cn("p-6", toneClasses[tone], className)} {...props} />;
}
