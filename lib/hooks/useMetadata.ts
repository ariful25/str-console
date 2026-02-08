import { useState, useCallback } from 'react';

export interface Tag {
  name: string;
  count: number;
  color: string;
  category?: string;
}

export function useMetadata() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/metadata/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');

      const data = await response.json();
      setTags(data.tags);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(
    async (name: string, color?: string, category?: string) => {
      try {
        setError(null);

        const response = await fetch('/api/metadata/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, color, category }),
        });

        if (!response.ok) throw new Error('Failed to create tag');

        const data = await response.json();
        setTags([...tags, data.tag]);
        return data.tag;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [tags]
  );

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
  };
}

export const TAG_CATEGORIES = ['general', 'urgent', 'billing', 'technical', 'feedback'];

export const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
];
