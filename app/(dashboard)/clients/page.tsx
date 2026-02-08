'use client';

import { useState } from 'react';
import { ClientForm } from '@/components/clients/client-form';
import { ClientList } from '@/components/clients/client-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Client } from '@/lib/hooks/useClients';

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingClient(undefined);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your property management clients</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="lg">
            + New Client
          </Button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingClient ? 'Edit Client' : 'Create New Client'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ClientForm
            client={editingClient}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </Card>
      )}

      {/* Client List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Clients</h2>
        <ClientList key={refreshKey} onEdit={handleEdit} />
      </div>
    </div>
  );
}
