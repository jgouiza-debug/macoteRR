import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramDetail } from "@/components/programs/ProgramDetail";
import { UNIVERSITY_PROGRAMS } from "@/lib/sample-data";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return UNIVERSITY_PROGRAMS.map((program) => ({ id: program.id }));
}

/** Public, statically prerendered catalogue page: the tab and the search result name the program. */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const program = UNIVERSITY_PROGRAMS.find((p) => p.id === id);
  return program ? { title: `${program.name} · ${program.institution}` } : {};
}

/**
 * The shipped constant decides which ids exist (static params, metadata, 404) and hands the
 * resolved entry down; the client component re-reads that id from the live reference
 * catalogue, so a correction promoted after this deploy shows without a rebuild.
 */
export default async function ProgramDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const program = UNIVERSITY_PROGRAMS.find((p) => p.id === id);
  if (!program) notFound();

  return <ProgramDetail program={program} />;
}
