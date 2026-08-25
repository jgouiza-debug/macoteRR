import { ResultsView } from "@/components/rscore/ResultsView";

export default async function OnboardingResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; status?: string }>;
}) {
  const params = await searchParams;
  const parsed = Number(params.score?.replace(",", "."));

  // No score in the URL means the student jumped straight here; the score step owns that
  // number, so send them to it rather than inventing a figure to render.
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const { redirect } = await import("next/navigation");
    redirect("/onboarding/score");
  }

  return (
    <ResultsView
      score={parsed}
      status={params.status === "confirmed" ? "confirmed" : "estimated"}
      onboarding
    />
  );
}
