import { School, BookOpen, CalendarRange, Tag, FileDown } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { STUDENT_SAMPLE } from "@/lib/sample-data";

const FIELDS = [
  { icon: School, label: "Cégep", value: STUDENT_SAMPLE.cegep.name },
  { icon: BookOpen, label: "Programme", value: STUDENT_SAMPLE.program.name },
  { icon: CalendarRange, label: "Session actuelle", value: STUDENT_SAMPLE.session.label },
];

export default function ProfilePage() {
  return (
    <AppShell rScore={STUDENT_SAMPLE.rScoreEstimated}>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6 md:px-8">
        <h1 className="font-display text-2xl font-bold text-ink">Profil</h1>

        <Card className="flex flex-col overflow-hidden p-0">
          {FIELDS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 border-b border-ink/10 p-4 last:border-b-0">
              <Icon className="h-5 w-5 flex-shrink-0 text-ink/50" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {label}
                </span>
                <span className="text-sm font-semibold text-ink">{value}</span>
              </div>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Tag className="h-4 w-4 text-ink/50" />
            Auto-étiquettes
          </h2>
          <p className="text-xs text-ink/50">
            Utilisées seulement pour le pointage des bourses — jamais de données financières.
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip tone="ultramarine">Bénévolat</Chip>
            <Chip>+ Ajouter</Chip>
          </div>
        </Card>

        <Button href="/counselor-prep" variant="secondary" size="lg" className="w-full">
          <FileDown className="h-[18px] w-[18px]" />
          Générer l&rsquo;export pour mon conseiller
        </Button>
      </div>
    </AppShell>
  );
}
