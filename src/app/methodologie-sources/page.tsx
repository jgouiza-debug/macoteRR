"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Database, Search, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/app-shell/Footer";
import { ALL_SOURCE_LINKS, type SourceLink } from "@/content/methodologie-sources";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type CategoryFilter = "all" | "university" | "college" | "bursary" | "formula";

export default function MethodologieSourcesPage() {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const filteredLinks = useMemo(() => {
    return ALL_SOURCE_LINKS.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.institution.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <Header />

      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto max-w-[900px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ultramarine hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ultramarine/[0.08] text-ultramarine">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink md:text-[32px]">
                {locale === "fr" ? "Méthodologie & Répertoire des Sources" : "Methodology & Sources Directory"}
              </h1>
              <p className="mt-1 text-[14px] text-ink/60">
                {locale === "fr"
                  ? "Toutes les sources officielles, portails d'admission et bases de données utilisés par MaCote."
                  : "All official sources, admission portals, and databases used by MaCote."}
              </p>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-ink/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === "fr" ? "Rechercher une université, une source, un programme..." : "Search a university, source, program..."}
                className="h-12 w-full rounded-xl border border-ink/15 bg-paper pl-10 pr-4 text-[14px] text-ink outline-none placeholder:text-ink/35 focus:border-ultramarine shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "Toutes les sources (" + ALL_SOURCE_LINKS.length + ")" },
                { id: "university", label: "Universités" },
                { id: "college", label: "Cégeps & Admission" },
                { id: "bursary", label: "Bourses" },
                { id: "formula", label: "Cote R & BCI" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as CategoryFilter)}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-all ${
                    activeCategory === tab.id
                      ? "bg-ultramarine text-paper shadow-sm"
                      : "border border-ink/12 bg-paper text-ink/70 hover:bg-chalk"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sources List */}
          <div className="mt-6 flex flex-col gap-3">
            {filteredLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1.5 rounded-xl border border-ink/10 bg-paper p-4 shadow-card transition-all hover:border-ultramarine/40 hover:shadow-overlay"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ultramarine">
                      {item.institution}
                    </span>
                    <h2 className="text-[14.5px] font-bold text-ink group-hover:text-ultramarine transition-colors">
                      {item.title}
                    </h2>
                  </div>
                  <ExternalLink className="h-4 w-4 text-ink/30 group-hover:text-ultramarine flex-shrink-0 mt-1" />
                </div>
                <p className="text-[13px] leading-relaxed text-ink/65">
                  {item.description}
                </p>
                <span className="mt-1 text-[11.5px] font-mono text-ink/40 truncate">
                  {item.url}
                </span>
              </a>
            ))}

            {filteredLinks.length === 0 && (
              <div className="rounded-xl border border-dashed border-ink/20 p-8 text-center text-[13.5px] text-ink/50">
                Aucune source trouvée pour cette recherche.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
