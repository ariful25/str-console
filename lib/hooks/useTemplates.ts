import { useCallback, useState } from 'react';

export interface Template {
  id: string;
  clientId: string | null;
  intent: string;
  label: string;
  text: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
  };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (clientId?: string, intent?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/templates';
      const params = new URLSearchParams();
      if (clientId) params.append('clientId', clientId);
      if (intent) params.append('intent', intent);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.ok ? data.results : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/templates?templateId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch template');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch template';
      setError(message);
      return null;
    }
  }, []);

  const createTemplate = useCallback(
    async (
      clientId: string | null,
      intent: string,
      label: string,
      text: string,
      isActive?: boolean
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            intent,
            label,
            text,
            isActive: isActive !== undefined ? isActive : true,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create template');
        }
        const data = await response.json();
        setTemplates((prev) => [data.result, ...prev]);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create template';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTemplate = useCallback(
    async (
      templateId: string,
      data: {
        label?: string;
        text?: string;
        isActive?: boolean;
      }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/templates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId, ...data }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update template');
        }
        const responseData = await response.json();
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? responseData.result : t))
        );
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update template';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/templates?templateId=${templateId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete template');
        }
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete template';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
