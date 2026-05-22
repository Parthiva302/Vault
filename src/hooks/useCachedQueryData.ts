import { useEffect } from 'react';

export const readCache = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const useCachedQueryData = <T,>(key: string, data: T) => {
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Best-effort cache for offline reads.
    }
  }, [data, key]);
};
