'use client';

import { useEffect, useState } from 'react';
import { useClients, Client } from '@/lib/hooks/useClients';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Building2 } from 'lucide-react';
import Link from 'next/link';

interface ClientListProps {
  onEdit?: (client: Client) => void;
}

export function ClientList({ onEdit }: ClientListProps) {
  const { clients, loading, error, fetchClients, deleteClient } = useClients();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    setDeleting(id);
    setDeleteError(null);
    const success = await deleteClient(id);
    if (!success) {
      // Error will be shown from the hook
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Loading clients...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <p className="text-red-700">Error loading clients: {error}</p>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No clients yet. Create one to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={onEdit}
          onDelete={handleDelete}
          isDeleting={deleting === client.id}
        />
      ))}
    </div>
  );
}

interface ClientCardProps {
  client: Client;
  onEdit?: (client: Client) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ClientCard({ client, onEdit, onDelete, isDeleting }: ClientCardProps) {
  const properties = client._count?.properties || 0;
  const threads = client._count?.threads || 0;
  const templates = client._count?.templates || 0;

  return (
    <Card className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{client.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {properties} {properties === 1 ? 'property' : 'properties'}
            </Badge>
            <Badge variant="secondary">
              {threads} {threads === 1 ? 'conversation' : 'conversations'}
            </Badge>
            <Badge variant="outline">
              {templates} {templates === 1 ? 'template' : 'templates'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Created {new Date(client.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(client)}
            title="Edit client"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(client.id)}
            disabled={isDeleting}
            title="Delete client"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
