"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { signalAppReady } from "@/lib/boot-ready";

/**
 * The one screen-change animation. Keyed on the route, so a tab switch or a detail push
 * fades the new content in; mounted fresh when a skeleton hands over to the real page, so
 * that swap fades in too. Opacity and a 4px rise, compositor-only, 200ms on the arrival
 * curve. It wraps the content only — never the fixed top and bottom bars, which must not
 * move or flash between screens.
 *
 * `skeleton` marks a placeholder render: it still animates, but it does not tell the boot
 * splash the app is ready.
 */
export function ContentTransition({
  children,
  skeleton = false,
  className = "",
}: {
  children: ReactNode;
  skeleton?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!skeleton) signalAppReady();
  }, [skeleton]);

  return (
    <div key={pathname} className={`animate-content-in ${className}`}>
      {children}
    </div>
  );
}
