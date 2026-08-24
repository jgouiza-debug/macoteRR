import { formatScore } from "@/lib/format";

type Size = "hero" | "md" | "sm";

const SIZE_CLASSES: Record<Size, string> = {
  hero: "text-[56px] md:text-[88px]",
  md: "text-[32px]",
  sm: "text-2xl",
};

export function ScoreValue({
  value,
  status,
  size = "md",
  label,
}: {
  value: number;
  status: "confirmed" | "estimated";
  size?: Size;
  label?: string;
}) {
  const displaySize: Size = status === "estimated" ? "md" : size;
  const defaultLabel = status === "confirmed" ? "Cote R confirmée" : "Estimation";

  const number = (
    <span
      className={`font-display font-extrabold leading-none tabular-nums text-ink ${SIZE_CLASSES[displaySize]}`}
    >
      {status === "estimated" && <span className="text-ink/40">≈&nbsp;</span>}
      {formatScore(value)}
    </span>
  );

  if (status === "estimated") {
    return (
      <div className="inline-flex flex-col items-start gap-1 rounded border border-dashed border-ink/35 bg-paper px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
          {label ?? defaultLabel}
        </span>
        {number}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
        {label ?? defaultLabel}
      </span>
      {number}
    </div>
  );
}
