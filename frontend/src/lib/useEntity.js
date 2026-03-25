"use client";

/**
 * lib/useEntity.js
 *
 * Drop-in replacement for the old useFetch hook.
 * Reads from the Zustand store cache instead of calling the API directly.
 *
 * Usage:
 *   const { data, loading, error, reload } = useEntity("users");
 *
 * - On first mount: triggers store.ensure(key) → fetches if not cached.
 * - On subsequent mounts (tab switches): data is already in store, no fetch.
 * - After mutations: call reload() to invalidate and re-fetch only this slice.
 */

import { useEffect } from "react";
import { useStore } from "./store";

export function useEntity(key) {
  const slice   = useStore((s) => s[key]);
  const ensure  = useStore((s) => s.ensure);
  const reload  = useStore((s) => s.reload);

  // On mount: load data if not yet cached
  useEffect(() => {
    ensure(key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data:    slice.data,
    loading: slice.loading,
    error:   slice.error,
    reload:  () => reload(key),
  };
}