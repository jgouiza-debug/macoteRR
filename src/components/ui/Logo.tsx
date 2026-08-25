export function LogoMark({
  size = 28,
  className,
  inverted = false,
}: {
  size?: number;
  className?: string;
  inverted?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={inverted ? "/brand/mark-reversed.png" : "/brand/mark.png"}
      alt=""
      width={size * 1.3}
      height={size}
      style={{ width: size * 1.3, height: size }}
      className={className}
    />
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
