import { useState, useCallback } from 'react';

export interface SendLogEntry {
  id: string;
  messageId: string;
  threadId: string;
  finalReply: string;
  channel: string;
  providerResponse?: any;
  createdAt: string;
  message: {
    text: string;
    senderType: string;
  };
  thread: {
    id: string;
    guestName: string;
    guestEmail: string;
    property: {
      id: string;
      name: string;
    };
  };
  sentByUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface SendLogFilters {
  threadId?: string;
  userId?: string;
  channel?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function useSendLogs() {
  const [logs, setLogs] = useState<SendLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
    hasMore: false,
  });

  const fetchLogs = useCallback(
    async (filters: SendLogFilters = {}, page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '50');

        if (filters.threadId) params.set('threadId', filters.threadId);
        if (filters.userId) params.set('userId', filters.userId);
        if (filters.channel) params.set('channel', filters.channel);
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
        if (filters.search) params.set('search', filters.search);

        const response = await fetch(`/api/send-logs?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch send logs');
        }

        const data = await response.json();

        setLogs(data.results);
        setPagination(data.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    logs,
    loading,
    error,
    pagination,
    fetchLogs,
  };
}
