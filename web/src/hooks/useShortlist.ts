import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "michelin-shortlist";

function readShortlist(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function useShortlist() {
  const [shortlist, setShortlist] = useState<Set<string>>(readShortlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...shortlist]));
  }, [shortlist]);

  const toggle = useCallback((id: string) => {
    setShortlist((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => shortlist.has(id),
    [shortlist],
  );

  return { shortlist, toggle, isSaved, count: shortlist.size };
}
