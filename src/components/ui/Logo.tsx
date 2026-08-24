const MARK_PATH =
  "M2,26 C7,26 9,25 11,19 C13,11 14,6 16,6 C18,6 19,11 21,19 C23,25 25,26 30,26";

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="MaCote"
      className={className}
    >
      <path d={MARK_PATH} stroke="#17181A" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="22" cy="21.5" r="4.5" fill="#E7E9E0" />
      <circle cx="22" cy="21.5" r="3.6" fill="#2B4CF5" />
    </svg>
  );
}

export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span className="font-display text-lg font-bold tracking-tight text-ink">MaCote</span>
    </span>
  );
}
