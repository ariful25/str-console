import { useCallback, useState } from 'react';

export interface DashboardStats {
  totalClients: number;
  totalProperties: number;
  totalMessages: number;
  totalThreads: number;
  activeThreads: number;
  pendingThreads: number;
  resolvedThreads: number;
  topClients: Array<{
    id: string;
    name: string;
    threadCount: number;
    messageCount: number;
  }>;
  threadsByStatus: {
    pending: number;
    open: number;
    resolved: number;
    closed: number;
  };
  recentMessages: Array<{
    id: string;
    text: string;
    senderType: 'Staff' | 'Guest';
    threadId: string;
    createdAt: string;
    thread: {
      guestName: string;
      property: {
        name: string;
      };
    };
  }>;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchStats };
}
