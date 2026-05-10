import * as React from "react";
import { cn } from "./cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ className, label, hint, error, id, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <label className="flex w-full flex-col gap-2" htmlFor={inputId}>
      {label ? (
        <span className="text-[14px] font-semibold leading-[1.42] tracking-[-0.01em] text-[var(--color-ink)]">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-[var(--radius-pill)] border px-5 text-[17px] leading-[1.47] tracking-[-0.02em]",
          "border-black/8 bg-white text-[var(--color-ink)] placeholder:text-[var(--color-body-muted)]",
          "focus:border-[var(--color-primary-focus)] focus:outline-none",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-[12px] leading-[1.33] text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-[12px] leading-[1.33] text-[var(--color-ink-muted-48)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
