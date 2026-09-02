"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Route-level error boundary for the signed-in pages. Everything the student typed is in the
 * local-first store, so the honest message is "nothing is lost", and the honest action is
 * `retry()` — Next re-renders the segment in place.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell>
      <EmptyState
        title={t("error.title")}
        body={t("error.body")}
        action={{ onClick: () => retry(), label: t("common.retry") }}
      />
    </AppShell>
  );
}
