'use client';

import { useEffect } from 'react';
import { useMessages, Message } from '@/lib/hooks/useMessageThread';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MessageListProps {
  threadId: string;
  refreshTrigger?: number; // Increment this to refresh the list
}

export function MessageList({ threadId, refreshTrigger }: MessageListProps) {
  const { messages, loading, error, fetchMessages } = useMessages();

  useEffect(() => {
    fetchMessages(threadId);
  }, [threadId, fetchMessages, refreshTrigger]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Loading messages...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <p className="text-red-700">Error loading messages: {error}</p>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          No messages yet. Start a conversation!
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}

interface MessageCardProps {
  message: Message;
}

function MessageCard({ message }: MessageCardProps) {
  const isStaff = message.senderType === 'staff';
  const date = new Date(message.receivedAt);
  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateString = date.toLocaleDateString();

  return (
    <Card className={`p-4 ${isStaff ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={isStaff ? 'default' : 'secondary'}>
            {isStaff ? 'Staff' : 'Guest'}
          </Badge>
          <span className="text-sm text-gray-500">
            {message.thread?.guestName || 'Unknown'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {timeString} · {dateString}
        </span>
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{message.text}</p>

      {message.analysis && (
        <div className="bg-white rounded p-3 border border-gray-200 text-sm space-y-1">
          {message.analysis.intent && (
            <div className="flex gap-2">
              <span className="text-gray-600 font-medium">Intent:</span>
              <span>{message.analysis.intent}</span>
            </div>
          )}
          {message.analysis.risk && (
            <div className="flex gap-2">
              <span className="text-gray-600 font-medium">Risk:</span>
              <Badge variant={
                message.analysis.risk === 'high' ? 'destructive' :
                message.analysis.risk === 'medium' ? 'default' :
                'secondary'
              }>
                {message.analysis.risk}
              </Badge>
            </div>
          )}
          {message.analysis.suggestedReply && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Suggested Reply:
              </p>
              <p className="text-gray-700">{message.analysis.suggestedReply}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
