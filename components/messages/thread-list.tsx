'use client';

import { useEffect, useState } from 'react';
import { useThreads, Thread } from '@/lib/hooks/useMessageThread';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThreadListProps {
  onSelectThread?: (threadId: string) => void;
  clientId?: string;
  propertyId?: string;
  status?: string;
}

export function ThreadList({
  onSelectThread,
  clientId,
  propertyId,
  status,
}: ThreadListProps) {
  const { threads, loading, error, fetchThreads } = useThreads();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchThreads({ clientId, propertyId, status });
  }, [clientId, propertyId, status, fetchThreads]);

  const handleSelectThread = (threadId: string) => {
    setSelectedId(threadId);
    onSelectThread?.(threadId);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Loading threads...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <p className="text-red-700">Error loading threads: {error}</p>
      </Card>
    );
  }

  if (threads.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          No threads found. Create one to get started!
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          isSelected={selectedId === thread.id}
          onSelect={handleSelectThread}
        />
      ))}
    </div>
  );
}

interface ThreadCardProps {
  thread: Thread;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ThreadCard({ thread, isSelected, onSelect }: ThreadCardProps) {
  const date = new Date(thread.lastReceivedAt);
  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateString = date.toLocaleDateString();

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 border-yellow-200',
    open: 'bg-blue-50 border-blue-200',
    resolved: 'bg-green-50 border-green-200',
    closed: 'bg-gray-50 border-gray-200',
  };

  return (
    <Card
      onClick={() => onSelect(thread.id)}
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${statusColors[thread.status] || 'hover:bg-gray-50'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{thread.guestName}</h3>
          {thread.guestEmail && (
            <p className="text-sm text-gray-600">{thread.guestEmail}</p>
          )}
        </div>
        <Badge variant="secondary">{thread.status}</Badge>
      </div>

      <p className="text-sm text-gray-700 mb-2">
        {thread.property?.name || 'Unknown Property'}
        {thread.property?.address && (
          <>
            <br />
            <span className="text-xs text-gray-500">{thread.property.address}</span>
          </>
        )}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{thread._count?.messages || 0} message(s)</span>
        <span>
          {timeString} · {dateString}
        </span>
      </div>
    </Card>
  );
}
