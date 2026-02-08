'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatusBreakdownProps {
  pending: number;
  open: number;
  resolved: number;
  closed: number;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  open: { color: 'bg-blue-100 text-blue-800', label: 'Open' },
  resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved' },
  closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
};

export function StatusBreakdown({
  pending,
  open,
  resolved,
  closed,
}: StatusBreakdownProps) {
  const total = pending + open + resolved + closed;
  const statuses = [
    { key: 'pending', count: pending, config: statusConfig.pending },
    { key: 'open', count: open, config: statusConfig.open },
    { key: 'resolved', count: resolved, config: statusConfig.resolved },
    { key: 'closed', count: closed, config: statusConfig.closed },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Conversation Status</h2>
      <div className="space-y-4">
        {statuses.map(({ key, count, config }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium capitalize">{key}</span>
              <Badge className={config.color}>{count} conversations</Badge>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${config.color}`}
                style={{
                  width: total > 0 ? `${(count / total) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
