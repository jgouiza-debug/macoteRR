import { notFound } from "next/navigation";
import { ProgramDetail } from "@/components/programs/ProgramDetail";
import { UNIVERSITY_PROGRAMS } from "@/lib/sample-data";

export function generateStaticParams() {
  return UNIVERSITY_PROGRAMS.map((program) => ({ id: program.id }));
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = UNIVERSITY_PROGRAMS.find((p) => p.id === id);
  if (!program) notFound();

  // The score is per-student and lives in the local-first profile, so ProgramDetail
  // reads it client-side rather than having it baked into this statically-rendered page.
  return <ProgramDetail program={program} />;
}
