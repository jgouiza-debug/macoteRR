import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type {
  NotificationCategory,
  NotificationPayload,
  NotificationPreferences,
  NotificationSubjectType,
} from "./types";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "./types";

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
 * Formats notification copy per the French (and English) copy templates in the product specification.
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
        const title = payload.title ?? "Deadline";
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
        const oldC = payload.oldCutoff !== undefined ? String(payload.oldCutoff).replace(".", ",") : "—";
        const newC = payload.newCutoff !== undefined ? String(payload.newCutoff).replace(".", ",") : "—";
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
      const title = payload.title ?? "Échéance";
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
      const oldC = payload.oldCutoff !== undefined ? String(payload.oldCutoff).replace(".", ",") : "—";
      const newC = payload.newCutoff !== undefined ? String(payload.newCutoff).replace(".", ",") : "—";
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
export async function getNotificationPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("deadline_reminders, cutoff_updates, new_bursary_matches, grade_window_reminders, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  return {
    deadlineReminders: data.deadline_reminders,
    cutoffUpdates: data.cutoff_updates,
    newBursaryMatches: data.new_bursary_matches,
    gradeWindowReminders: data.grade_window_reminders,
    updatedAt: data.updated_at,
  };
}

/**
 * Saves notification preferences to Supabase.
 */
export async function saveNotificationPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  prefs: NotificationPreferences,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: userId,
      deadline_reminders: prefs.deadlineReminders,
      cutoff_updates: prefs.cutoffUpdates,
      new_bursary_matches: prefs.newBursaryMatches,
      grade_window_reminders: prefs.gradeWindowReminders,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return { error: error ? new Error(error.message) : null };
}
