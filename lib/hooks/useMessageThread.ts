import { useState, useCallback } from 'react';

// Types
export interface Message {
  id: string;
  threadId: string;
  senderType: string;
  text: string;
  receivedAt: string;
  createdAt: string;
  thread?: {
    id: string;
    guestName: string;
    guestEmail?: string;
  };
  analysis?: {
    intent?: string;
    risk: string;
    urgency: string;
    suggestedReply?: string;
  };
}

export interface Thread {
  id: string;
  clientId: string;
  propertyId: string;
  guestName: string;
  guestEmail?: string;
  status: string;
  lastReceivedAt: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
  };
  property?: {
    id: string;
    name: string;
    address?: string;
  };
  _count?: {
    messages: number;
  };
}

interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  fetchMessages: (threadId?: string) => Promise<void>;
  createMessage: (threadId: string, senderType: string, text: string) => Promise<Message | null>;
}

interface UseThreadsResult {
  threads: Thread[];
  loading: boolean;
  error: string | null;
  fetchThreads: (filters?: { clientId?: string; propertyId?: string; status?: string }) => Promise<void>;
  createThread: (clientId: string, propertyId: string, guestName: string, guestEmail?: string) => Promise<Thread | null>;
  updateThreadStatus: (threadId: string, status: string) => Promise<Thread | null>;
}

/**
 * Hook to manage messages
 */
export function useMessages(): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (threadId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = threadId 
        ? `/api/messages?threadId=${threadId}` 
        : '/api/messages';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMessage = useCallback(async (
    threadId: string,
    senderType: string,
    text: string
  ): Promise<Message | null> => {
    setError(null);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, senderType, text }),
      });

      if (!response.ok) throw new Error('Failed to create message');

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  }, []);

  return { messages, loading, error, fetchMessages, createMessage };
}

/**
 * Hook to manage threads
 */
export function useThreads(): UseThreadsResult {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async (filters?: {
    clientId?: string;
    propertyId?: string;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.propertyId) params.append('propertyId', filters.propertyId);
      if (filters?.status) params.append('status', filters.status);

      const url = `/api/threads${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch threads');
      
      const data = await response.json();
      setThreads(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createThread = useCallback(async (
    clientId: string,
    propertyId: string,
    guestName: string,
    guestEmail?: string
  ): Promise<Thread | null> => {
    setError(null);
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, propertyId, guestName, guestEmail }),
      });

      if (!response.ok) throw new Error('Failed to create thread');

      const newThread = await response.json();
      setThreads(prev => [...prev, newThread]);
      return newThread;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  }, []);

  const updateThreadStatus = useCallback(async (
    threadId: string,
    status: string
  ): Promise<Thread | null> => {
    setError(null);
    try {
      const response = await fetch('/api/threads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: threadId, status }),
      });

      if (!response.ok) throw new Error('Failed to update thread');

      const updatedThread = await response.json();
      setThreads(prev =>
        prev.map(t => (t.id === threadId ? updatedThread : t))
      );
      return updatedThread;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  }, []);

  return {
    threads,
    loading,
    error,
    fetchThreads,
    createThread,
    updateThreadStatus,
  };
}
