import type { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded border border-ink/15 bg-paper shadow-card ${className}`}
      {...rest}
    />
  );
}
