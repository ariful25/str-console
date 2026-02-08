'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface RecentMessage {
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
}

interface RecentActivityProps {
  messages: RecentMessage[];
}

export function RecentActivity({ messages }: RecentActivityProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500 text-sm">No messages yet</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Link key={msg.id} href={`/inbox/${msg.threadId}`}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={msg.senderType === 'Staff' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {msg.senderType}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatTime(msg.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{msg.thread.guestName}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {msg.thread.property.name}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{msg.text}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
