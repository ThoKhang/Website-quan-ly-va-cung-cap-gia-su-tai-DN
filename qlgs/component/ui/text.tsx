import * as React from "react";
import { cn } from "./cn";

type TextAs = "span" | "p" | "div" | "label" | "a" | "h1" | "h2" | "h3";
type TextSize =
  | "hero"
  | "display"
  | "title"
  | "lead"
  | "body"
  | "bodyStrong"
  | "caption"
  | "fine";
type TextTone = "default" | "muted" | "primary" | "onDark";
type TextAlign = "left" | "center" | "right";

export type TextProps<T extends TextAs = "p"> = {
  as?: T;
  size?: TextSize;
  tone?: TextTone;
  align?: TextAlign;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const sizeClasses: Record<TextSize, string> = {
  hero:
    "font-[var(--font-display)] text-[34px] font-semibold leading-[1.07] tracking-[-0.28px] md:text-[56px]",
  display:
    "font-[var(--font-display)] text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[40px]",
  title:
    "font-[var(--font-display)] text-[21px] font-semibold leading-[1.19] tracking-[0.01em]",
  lead: "text-[21px] font-normal leading-[1.35] tracking-[0.01em] md:text-[28px]",
  body: "text-[17px] font-normal leading-[1.47] tracking-[-0.02em]",
  bodyStrong: "text-[17px] font-semibold leading-[1.24] tracking-[-0.02em]",
  caption: "text-[14px] font-normal leading-[1.42] tracking-[-0.01em]",
  fine: "text-[12px] font-normal leading-[1.33] text-[var(--color-ink-muted-48)]",
};

const toneClasses: Record<TextTone, string> = {
  default: "text-[var(--color-ink)]",
  muted: "text-[var(--color-body-muted)]",
  primary: "text-[var(--color-primary)]",
  onDark: "text-[var(--color-body-on-dark)]",
};

const alignClasses: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Text<T extends TextAs = "p">({
  as,
  size = "body",
  tone = "default",
  align = "left",
  className,
  children,
  ...props
}: TextProps<T>) {
  const Component = (as ?? "p") as React.ElementType;

  return (
    <Component
      className={cn(sizeClasses[size], toneClasses[tone], alignClasses[align], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
