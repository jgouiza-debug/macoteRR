import type { NotificationCategory, NotificationSubjectType } from "@/lib/db/database.types";
import type { CutoffRange } from "@/lib/rscore/cutoff-range";

export type { NotificationCategory, NotificationSubjectType };

export type NotificationPreferences = {
  deadlineReminders: boolean;
  cutoffUpdates: boolean;
  newBursaryMatches: boolean;
  gradeWindowReminders: boolean;
  updatedAt?: string | null;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  deadlineReminders: false,
  cutoffUpdates: false,
  newBursaryMatches: false,
  gradeWindowReminders: false,
};

export type NotificationPayload = {
  title?: string;
  amount?: number;
  daysLeft?: number;
  foundationName?: string;
  programName?: string;
  /** cutoff_update: the published range before and after; a range is never one figure. */
  oldRange?: CutoffRange | null;
  newRange?: CutoffRange | null;
  /** deadline_reminder: the title in both languages; the formatter picks by locale. */
  titleFr?: string;
  titleEn?: string;
  sessionName?: string;
  cegepName?: string;
  gap?: number;
  newMatchesCount?: number;
  deepLink?: string;
  [key: string]: unknown;
};

export type NotificationEvent = {
  id: string;
  userId: string;
  category: NotificationCategory;
  subjectType: NotificationSubjectType;
  subjectId: string;
  payload: NotificationPayload;
  scheduledFor: string;
  sentAt: string | null;
  dedupeKey: string;
  createdAt: string;
};
