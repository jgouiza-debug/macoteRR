import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false, follow: false },
};

/**
 * The offline fallback the service worker serves when a navigation misses both the network and
 * the page cache. A server component with inline bilingual copy and no client JS, same
 * convention as not-found.tsx (there is no LocaleProvider on a page the SW serves cold). The
 * retry link is a plain full navigation, so it goes back through the SW's network-first rule.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-chalk px-5 text-center">
      <p className="text-[15px] font-semibold text-ink">Tu es hors ligne. · You&apos;re offline.</p>
      <p className="max-w-[300px] text-[13px] leading-relaxed text-ink/60">
        Reconnecte-toi pour continuer. · Reconnect to continue.
      </p>
      <a
        href="/app"
        className="flex h-12 items-center justify-center rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed"
      >
        Réessayer · Retry
      </a>
    </main>
  );
}
