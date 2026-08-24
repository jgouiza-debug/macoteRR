"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-ultramarine px-6 py-3 text-sm font-semibold text-paper shadow-card transition-colors hover:bg-ink"
    >
      <Printer className="h-[18px] w-[18px]" />
      Imprimer / Exporter en PDF
    </button>
  );
}
