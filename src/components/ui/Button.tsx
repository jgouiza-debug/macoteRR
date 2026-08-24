import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ultramarine text-paper hover:bg-ink shadow-card",
  secondary: "bg-paper text-ink border border-ink/25 hover:border-ink",
  ghost: "text-ultramarine hover:text-ink",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  disabled?: boolean;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", children, className = "", ...rest } = props;
  const classes = `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  if ("href" in rest && rest.href) {
    const { href, disabled } = rest as { href: string; disabled?: boolean };
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
