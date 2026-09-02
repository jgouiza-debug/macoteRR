"use client";

import { useCallback } from "react";
import { useStudentProfile } from "./store";

/**
 * The one way to change the student's target programs. The detail page's toggle, the goal
 * wizard's batch save, and the remove buttons on the dashboard and profile all go through
 * here, so the list is mutated the same way everywhere and every change reaches the outbox
 * (src/lib/profile/sync.ts diffs it against the server, deletes included).
 */
export function useTargets() {
  const { profile, update } = useStudentProfile();
  const ids = profile.targetUniversityProgramIds;

  const setAll = useCallback(
    (next: string[]) => update({ targetUniversityProgramIds: Array.from(new Set(next)) }),
    [update],
  );

  const add = useCallback(
    (id: string) => {
      if (ids.includes(id)) return;
      setAll([...ids, id]);
    },
    [ids, setAll],
  );

  const remove = useCallback(
    (id: string) => {
      if (!ids.includes(id)) return;
      setAll(ids.filter((x) => x !== id));
    },
    [ids, setAll],
  );

  const toggle = useCallback(
    (id: string) => (ids.includes(id) ? remove(id) : add(id)),
    [ids, add, remove],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, has, add, remove, toggle, setAll };
}
