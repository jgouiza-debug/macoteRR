import { redirect } from "next/navigation";

/**
 * `/app` is the PWA start URL and the marketing site's "continue in browser" target. It only
 * forwards to the dashboard, but a `?lang=en|fr` hand-off from the English site has to ride
 * along: src/proxy.ts carries it through the sign-in bounce, and the LocaleProvider consumes
 * it on whichever page finally renders. Anything else in the query is dropped.
 */
export default async function AppPage({ searchParams }: PageProps<"/app">) {
  const { lang } = await searchParams;
  const locale = lang === "en" || lang === "fr" ? lang : null;
  redirect(locale ? `/dashboard?lang=${locale}` : "/dashboard");
}
