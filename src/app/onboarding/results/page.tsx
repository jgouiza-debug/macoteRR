import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResultsView } from "@/components/rscore/ResultsView";

export const metadata: Metadata = { title: "Tes résultats" };

export default async function OnboardingResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; status?: string }>;
}) {
  const params = await searchParams;
  const parsed = Number(params.score?.replace(",", "."));

  // No usable score in the URL means this page was reached out of order. Send the student
  // back to enter one rather than falling back to STUDENT_SAMPLE's 32,4 — which rendered a
  // full results screen, headline included, for a number that was never theirs.
  if (!Number.isFinite(parsed) || parsed <= 0) redirect("/onboarding/score");

  return (
    <ResultsView score={parsed} status={params.status === "confirmed" ? "confirmed" : "estimated"} />
  );
}
