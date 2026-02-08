'use client';

import { useState, useCallback } from 'react';

export interface Client {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    properties: number;
    threads: number;
    templates: number;
  };
  properties?: Array<{
    id: string;
    name: string;
    address?: string;
    _count?: {
      threads: number;
    };
  }>;
  pmsAccounts?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface UseClientsResult {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  getClient: (id: string) => Promise<Client | null>;
  createClient: (name: string) => Promise<Client | null>;
  updateClient: (id: string, name: string) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
}

/**
 * Hook to manage clients
 */
export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');

      const data = await response.json();
      setClients(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getClient = useCallback(async (id: string): Promise<Client | null> => {
    setError(null);
    try {
      const response = await fetch(`/api/clients?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch client');

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  }, []);

  const createClient = useCallback(
    async (name: string): Promise<Client | null> => {
      setError(null);
      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create client');
        }

        const newClient = await response.json();
        setClients((prev) => [...prev, newClient]);
        return newClient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      }
    },
    []
  );

  const updateClient = useCallback(
    async (id: string, name: string): Promise<Client | null> => {
      setError(null);
      try {
        const response = await fetch('/api/clients', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update client');
        }

        const updatedClient = await response.json();
        setClients((prev) =>
          prev.map((c) => (c.id === id ? updatedClient : c))
        );
        return updatedClient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      }
    },
    []
  );

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch('/api/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete client');
      }

      setClients((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    }
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
  };
}
