import type { NotificationCategory, NotificationSubjectType } from "@/lib/db/database.types";

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
  oldCutoff?: number;
  newCutoff?: number;
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
