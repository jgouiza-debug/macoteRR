import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The one empty state. Every empty list, missing profile, and "nothing here yet" screen used
 * to hand-roll the same centred paragraph plus a pill link; the dashboard and programs copies
 * had already drifted apart. An empty state names the next action or it is not done.
 */
export function EmptyState({
  title,
  body,
  action,
  icon,
  compact = false,
}: {
  title: string;
  body?: string;
  action?: { href: string; label: string } | { onClick: () => void; label: string };
  icon?: ReactNode;
  /** Tighter vertical rhythm for an empty section inside a card, vs. a whole empty page. */
  compact?: boolean;
}) {
  const buttonClass =
    "flex h-12 items-center justify-center rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper shadow-card tap-spring active:scale-[0.98]";
  return (
    <div
      className={`mx-auto flex w-full max-w-[420px] flex-col items-center gap-3 px-4 text-center ${
        compact ? "py-4" : "py-16"
      }`}
    >
      {icon && <div className="text-ink/35">{icon}</div>}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {body && <p className="text-[13.5px] leading-relaxed text-ink/60">{body}</p>}
      {action &&
        ("href" in action ? (
          <Link href={action.href} className={`${buttonClass} mt-1`}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={`${buttonClass} mt-1`}>
            {action.label}
          </button>
        ))}
    </div>
  );
}
