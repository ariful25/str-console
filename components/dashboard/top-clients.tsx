'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface TopClient {
  id: string;
  name: string;
  threadCount: number;
  messageCount: number;
}

interface TopClientsProps {
  clients: TopClient[];
}

export function TopClients({ clients }: TopClientsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Top Clients</h2>
      {clients.length === 0 ? (
        <p className="text-gray-500 text-sm">No client activity yet</p>
      ) : (
        <div className="space-y-3">
          {clients.map((client, index) => (
            <Link key={client.id} href={`/clients`}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-gray-500">
                      {client.messageCount} messages
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{client.threadCount} conversations</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
