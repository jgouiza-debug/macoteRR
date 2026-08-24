export function LogoMark({
  size = 28,
  className,
  inverted = false,
}: {
  size?: number;
  className?: string;
  inverted?: boolean;
}) {
  const color = inverted ? "#FFFFFF" : "#2B4CF5";

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
      {/* Mortarboard Diamond Top */}
      <path d="M16 4L30 11L16 18L2 11L16 4Z" fill={color} />

      {/* Mortarboard Cap Body */}
      <path
        d="M7 14.5V20.5C7 24.5 16 27.5 16 27.5C16 27.5 25 24.5 25 20.5V14.5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tassel */}
      <path
        d="M26.5 12.5V22C26.5 23 25 23 25 22V12.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="25.75" cy="23" r="1.25" fill={color} />
    </svg>
  );
}

export function Logo({
  size = 24,
  className,
  inverted = false,
}: {
  size?: number;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} inverted={inverted} />
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          inverted ? "text-paper" : "text-ultramarine"
        }`}
      >
        MaCote
      </span>
    </span>
  );
}
