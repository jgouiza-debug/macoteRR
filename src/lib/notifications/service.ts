import { formatScore } from "@/lib/format";
import { formatRangeYears, type CutoffRange } from "@/lib/rscore/cutoff-range";
import type {
  NotificationCategory,
  NotificationPayload,
  NotificationSubjectType,
} from "./types";

/**
 * Computes deterministic dedupe keys to ensure nightly/batch cron jobs never
 * queue duplicate notifications for the same event.
 */
export function buildNotificationDedupeKey(params: {
  category: NotificationCategory;
  userId: string;
  subjectId: string;
  qualifier?: string | number;
}): string {
  const parts = [params.category, params.userId, params.subjectId];
  if (params.qualifier !== undefined) {
    parts.push(String(params.qualifier));
  }
  return parts.join(":");
}

/**
 * Maps every notification category and subject to an in-app deep link.
 * Notifications must always lead to a specific destination screen, never a bare app open.
 */
export function getNotificationDeepLink(params: {
  category: NotificationCategory;
  subjectType?: NotificationSubjectType;
  subjectId?: string;
  catalogSlug?: string;
}): string {
  switch (params.category) {
    case "new_bursary_match":
      return "/bursaries";
    case "deadline_reminder":
      if (params.subjectType === "bursary") {
        return "/bursaries";
      }
      return "/dashboard";
    case "cutoff_update":
      if (params.catalogSlug) {
        return `/programs/${params.catalogSlug}`;
      }
      if (params.subjectId) {
        return `/programs/${params.subjectId}`;
      }
      return "/programs";
    case "grade_window":
      return "/dashboard";
    case "counselor_season":
      return "/counselor-prep";
    default:
      return "/dashboard";
  }
}

/**
 * A published range as src/lib/notifications/derive.ts carries it in a cutoff_update payload
 * (`oldRange` / `newRange`: the getCutoffRange shape, or null when nothing was published).
 * Anything that is not that shape reads as null — "not yet verified" — never as a number.
 */
function readCutoffRange(value: unknown): CutoffRange | null {
  if (typeof value !== "object" || value === null) return null;
  const { low, high, years, kind } = value as Record<string, unknown>;
  if (typeof low !== "number" || !Number.isFinite(low)) return null;
  if (typeof high !== "number" || !Number.isFinite(high)) return null;
  if (!Array.isArray(years) || !years.every((year) => typeof year === "number")) return null;
  // Payloads written before the kind existed described admitted-score ranges.
  return { low, high, years, kind: kind === "floor" ? "floor" : "range" };
}

/**
 * "22,0–22,5 (2024–2025)": both ends of the range and its years, even when the ends coincide —
 * universities publish ranges, never one figure (src/lib/rscore/cutoff-range.ts), so the copy
 * never collapses one. A null side is an em dash, the same "not yet verified" every screen
 * shows; it never reads as open admission.
 */
function formatCutoffRange(value: unknown, locale: "fr" | "en"): string {
  const range = readCutoffRange(value);
  if (!range) return "—";
  const span = `${formatScore(range.low, locale)}–${formatScore(range.high, locale)}`;
  return range.years.length > 0 ? `${span} (${formatRangeYears(range)})` : span;
}

/** The deadline's title in the reader's language; `title` (French) is the pre-locale fallback. */
function readDeadlineTitle(payload: NotificationPayload, locale: "fr" | "en"): string | undefined {
  const localized = locale === "en" ? payload.titleEn : payload.titleFr;
  return typeof localized === "string" && localized.length > 0 ? localized : payload.title;
}

/**
 * Formats notification copy per the French (and English) copy templates in the product specification.
 *
 * Payload fields read, per category (derive.ts writes exactly these):
 *   - deadline_reminder: titleFr / titleEn picked by locale (`title` as fallback), daysLeft, gap;
 *   - new_bursary_match: newMatchesCount, foundationName, daysLeft (absent once the deadline passed);
 *   - cutoff_update: programName, oldRange / newRange rendered as "low–high (years)" or an em dash.
 */
export function formatNotificationCopy(
  category: NotificationCategory,
  payload: NotificationPayload,
  locale: "fr" | "en" = "fr",
): { title: string; body: string } {
  if (locale === "en") {
    switch (category) {
      case "new_bursary_match": {
        const n = payload.newMatchesCount ?? 1;
        const foundation = payload.foundationName ?? "your foundation";
        const days = payload.daysLeft !== undefined ? ` The nearest deadline is in ${payload.daysLeft} days.` : "";
        return {
          title: "New matching bursary",
          body: `${n} new bursary/ies unlocked at ${foundation}.${days}`,
        };
      }
      case "deadline_reminder": {
        const title = readDeadlineTitle(payload, "en") ?? "Deadline";
        const days = payload.daysLeft ?? 14;
        const gapText = payload.gap !== undefined ? ` You are ${payload.gap} from the required score.` : "";
        return {
          title: "Upcoming deadline",
          body: `${title} closes in ${days} days.${gapText}`,
        };
      }
      case "grade_window":
        return {
          title: "Session grades available",
          body: "Your session grades are likely out. Update your score for more accurate projections.",
        };
      case "cutoff_update": {
        const prog = payload.programName ?? "Target program";
        const oldC = formatCutoffRange(payload.oldRange, "en");
        const newC = formatCutoffRange(payload.newRange, "en");
        return {
          title: "Cutoff changed",
          body: `The cutoff for ${prog} changed: ${oldC} → ${newC}. Check where you stand.`,
        };
      }
      case "counselor_season":
        return {
          title: "Academic guidance appointments",
          body: "Appointment booking windows with academic advisors are opening. Generate your prep page before meeting.",
        };
    }
  }

  // Default: French
  switch (category) {
    case "new_bursary_match": {
      const n = payload.newMatchesCount ?? 1;
      const foundation = payload.foundationName ?? "ta fondation";
      const days = payload.daysLeft !== undefined ? ` La plus proche ferme dans ${payload.daysLeft} jours.` : "";
      return {
        title: "Nouvelle bourse admissible",
        body: `${n} nouvelle(s) bourse(s) débloquée(s) chez ${foundation}.${days}`,
      };
    }
    case "deadline_reminder": {
      const title = readDeadlineTitle(payload, "fr") ?? "Échéance";
      const days = payload.daysLeft ?? 14;
      const gapText = payload.gap !== undefined ? ` Tu es à ${payload.gap} de la cote requise.` : "";
      return {
        title: "Échéance à l'approche",
        body: `${title} ferme dans ${days} jours.${gapText}`,
      };
    }
    case "grade_window":
      return {
        title: "Notes de session",
        body: "Tes notes de session sont probablement sorties. Mets à jour ta cote pour des projections plus précises.",
      };
    case "cutoff_update": {
      const prog = payload.programName ?? "Programme cible";
      const oldC = formatCutoffRange(payload.oldRange, "fr");
      const newC = formatCutoffRange(payload.newRange, "fr");
      return {
        title: "Mise à jour d'un seuil",
        body: `Le seuil de ${prog} a changé : ${oldC} → ${newC}. Vérifie où tu te situes.`,
      };
    }
    case "counselor_season":
      return {
        title: "Rencontre d'orientation",
        body: "La période de rendez-vous avec les conseillers d'orientation approche. Génère ta page de préparation avant ton rendez-vous.",
      };
  }
}

/**
 * Loads the user's notification preferences from Supabase.
 * Returns default (all false) if no record exists yet.
 */
