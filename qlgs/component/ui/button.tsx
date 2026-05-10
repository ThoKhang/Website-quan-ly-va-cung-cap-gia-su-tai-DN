"use client";

import * as React from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-[var(--color-primary)] text-white hover:bg-[#005bb5]",
  secondary:
    "border border-[var(--color-divider-soft)] bg-[var(--color-surface-pearl)] text-[var(--color-ink)] hover:bg-white",
  ghost:
    "border border-transparent bg-transparent text-[var(--color-primary)] hover:bg-black/[0.03]",
  dark: "border border-transparent bg-[var(--color-ink)] text-white hover:bg-black",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-[17px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-pill)] font-medium tracking-[-0.01em]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth && "w-full",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
