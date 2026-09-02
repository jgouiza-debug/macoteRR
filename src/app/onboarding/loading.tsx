/**
 * Skeleton shaped like a funnel step: the 56px top bar, a heading, a body line, and three
 * option rows at the widths the real steps use. No spinner, on purpose.
 */
export default function OnboardingLoading() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk" aria-busy="true" aria-live="polite">
      <div className="pt-safe">
        <div className="mx-auto h-14 w-full max-w-[430px] px-5" />
      </div>
      <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center px-5 pt-2">
        <div className="mb-6 flex flex-col gap-2.5 pt-3">
          <div className="h-8 w-3/4 animate-pulse rounded bg-ink/8" />
          <div className="h-4 w-full animate-pulse rounded bg-ink/6" />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="h-14 animate-pulse rounded-xl border border-ink/8 bg-paper" />
          <div className="h-14 animate-pulse rounded-xl border border-ink/8 bg-paper" />
          <div className="h-14 animate-pulse rounded-xl border border-ink/8 bg-paper" />
        </div>
      </main>
    </div>
  );
}
