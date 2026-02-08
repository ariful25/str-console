import { useState, useCallback } from 'react';

export interface KBSearchResult {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  sourcesCount: number;
  preview: string;
}

export interface KBStats {
  totalEntries: number;
  recentEntries: number;
}

export function useKBLearning() {
  const [results, setResults] = useState<KBSearchResult[]>([]);
  const [stats, setStats] = useState<KBStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        query,
        limit: String(limit),
      });

      const response = await fetch(`/api/kb-learning/search?${params}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data.results);
      return data.results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/kb-learning/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }, []);

  return {
    results,
    stats,
    loading,
    error,
    search,
    fetchStats,
  };
}
