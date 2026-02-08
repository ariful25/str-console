import { useCallback, useState } from 'react';

export interface Property {
  id: string;
  clientId: string;
  pmsAccountId: string;
  listingMapId: string;
  name: string;
  address: string | null;
  createdAt: string;
  client?: {
    id: string;
    name: string;
  };
  pmsAccount?: {
    id: string;
    name: string;
    type: string;
  };
  _count?: {
    threads: number;
    autoRules: number;
  };
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (clientId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = clientId ? `/api/properties?clientId=${clientId}` : '/api/properties';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch properties';
      setError(message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProperty = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/properties?propertyId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch property');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch property';
      setError(message);
      return null;
    }
  }, []);

  const createProperty = useCallback(
    async (clientId: string, name: string, data?: Partial<Property>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            name,
            ...data,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create property');
        }
        const newProperty = await response.json();
        setProperties((prev) => [newProperty, ...prev]);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create property';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProperty = useCallback(
    async (id: string, data: Partial<Property>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/properties', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update property');
        }
        const updated = await response.json();
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
        );
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update property';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/properties', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete property');
        }
        setProperties((prev) => prev.filter((p) => p.id !== id));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete property';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    properties,
    loading,
    error,
    fetchProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}
