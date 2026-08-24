import { ResultsView } from "@/components/rscore/ResultsView";
import { STUDENT_SAMPLE } from "@/lib/sample-data";

export default async function OnboardingResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; status?: string }>;
}) {
  const params = await searchParams;
  const parsed = Number(params.score?.replace(",", "."));
  const score =
    Number.isFinite(parsed) && parsed > 0 ? parsed : STUDENT_SAMPLE.rScoreEstimated;

  return (
    <ResultsView score={score} status={params.status === "confirmed" ? "confirmed" : "estimated"} />
  );
}
