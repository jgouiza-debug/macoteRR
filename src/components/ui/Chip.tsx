import type { ReactNode } from "react";

type Tone = "neutral" | "moss" | "ember" | "ultramarine";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-chalk text-ink",
  moss: "bg-moss/10 text-moss",
  ember: "bg-ember/10 text-ember",
  ultramarine: "bg-ultramarine/10 text-ultramarine",
};

export function Chip({
  children,
  tone = "neutral",
  icon,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
