import { AppShell } from "@/components/app-shell/AppShell";

/**
 * Geometry-matched skeleton for the signed-in pages: a title line and three cards at the
 * widths the real pages use, so the swap to content moves nothing. No spinner, on purpose.
 */
export default function AppLoading() {
  return (
    <AppShell footer={false}>
      <div
        className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-8 w-40 animate-pulse rounded bg-ink/8" />
        <div className="h-44 animate-pulse rounded-xl border border-ink/8 bg-paper" />
        <div className="h-40 animate-pulse rounded-xl border border-ink/8 bg-paper" />
        <div className="h-56 animate-pulse rounded-xl border border-ink/8 bg-paper" />
      </div>
    </AppShell>
  );
}
