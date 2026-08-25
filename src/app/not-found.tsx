import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-chalk px-5 text-center">
      <p className="text-[15px] font-medium text-ink">
        Page introuvable. · Page not found.
      </p>
      <Link
        href="/"
        className="flex h-12 items-center justify-center rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed"
      >
        Retour à l&apos;accueil · Back to home
      </Link>
    </main>
  );
}
