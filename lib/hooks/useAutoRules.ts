import { useState, useCallback, useEffect } from 'react';

export interface AutoRule {
  id: string;
  clientId?: string;
  propertyId?: string;
  intent?: string;
  riskMax?: string;
  conditions?: Record<string, any>;
  action: 'queue' | 'template' | 'auto_send';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRuleInput {
  propertyId?: string;
  intent?: string;
  riskMax?: string;
  conditions?: Record<string, any>;
  action: 'queue' | 'template' | 'auto_send';
  templateId?: string;
}

interface UseAutoRulesReturn {
  rules: AutoRule[];
  loading: boolean;
  error: string | null;
  fetchRules: (propertyId?: string) => Promise<void>;
  createRule: (rule: CreateRuleInput) => Promise<AutoRule>;
  updateRule: (id: string, rule: Partial<CreateRuleInput>) => Promise<AutoRule>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string, enabled: boolean) => Promise<void>;
}

export function useAutoRules(clientId?: string, propertyId?: string): UseAutoRulesReturn {
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);

  // Determine clientId and propertyId from props, URL, or localStorage
  useEffect(() => {
    if (clientId) {
      setCurrentClientId(clientId);
    } else {
      const params = new URLSearchParams(window.location.search);
      const urlClientId = params.get('clientId');
      const stored = localStorage.getItem('currentClientId');
      setCurrentClientId(urlClientId || stored || null);
    }

    if (propertyId) {
      setCurrentPropertyId(propertyId);
    } else {
      const params = new URLSearchParams(window.location.search);
      const urlPropertyId = params.get('propertyId');
      const stored = localStorage.getItem('currentPropertyId');
      setCurrentPropertyId(urlPropertyId || stored || null);
    }
  }, [clientId, propertyId]);

  const fetchRules = useCallback(
    async (propId?: string) => {
      const filteredPropertyId = propId || currentPropertyId;
      
      if (!currentClientId) return;

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ clientId: currentClientId });
        if (filteredPropertyId) {
          params.append('propertyId', filteredPropertyId);
        }
        const res = await fetch(`/api/auto-rules?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch rules');
        const data = await res.json();
        setRules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [currentClientId, currentPropertyId]
  );

  const createRule = useCallback(
    async (rule: CreateRuleInput): Promise<AutoRule> => {
      if (!currentClientId) throw new Error('Client ID required');
      setError(null);
      try {
        const params = new URLSearchParams({ clientId: currentClientId });
        const res = await fetch(`/api/auto-rules?${params.toString()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rule),
        });
        if (!res.ok) throw new Error('Failed to create rule');
        const newRule = await res.json();
        setRules((prev) => [...prev, newRule]);
        return newRule;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    [currentClientId]
  );

  const updateRule = useCallback(
    async (id: string, rule: Partial<CreateRuleInput>): Promise<AutoRule> => {
      setError(null);
      try {
        const res = await fetch(`/api/auto-rules?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rule),
        });
        if (!res.ok) throw new Error('Failed to update rule');
        const updated = await res.json();
        setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteRule = useCallback(async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/auto-rules?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete rule');
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  }, []);

  const toggleRule = useCallback(
    async (id: string, enabled: boolean) => {
      setError(null);
      try {
        const res = await fetch(`/api/auto-rules?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        });
        if (!res.ok) throw new Error('Failed to toggle rule');
        const updated = await res.json();
        setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      }
    },
    []
  );

  return { rules, loading, error, fetchRules, createRule, updateRule, deleteRule, toggleRule };
}
