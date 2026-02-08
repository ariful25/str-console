'use client';

import { useEffect, useState } from 'react';
import { useClients } from '@/lib/hooks/useClients';
import { PropertyForm } from '@/components/properties/property-form';
import { PropertyList } from '@/components/properties/property-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Property } from '@/lib/hooks/useProperties';

export default function PropertiesPage() {
  const { clients, fetchClients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProperty(undefined);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProperty(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-gray-600 mt-1">Manage properties for your clients</p>
        </div>
        {selectedClientId && !showForm && (
          <Button onClick={() => setShowForm(true)} size="lg">
            + New Property
          </Button>
        )}
      </div>

      {/* Client Selection */}
      <Card className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Client
        </label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a client to manage their properties...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </Card>

      {selectedClientId && (
        <>
          {/* Form Section */}
          {showForm && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingProperty ? 'Edit Property' : 'Create New Property'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <PropertyForm
                property={editingProperty}
                clientId={selectedClientId}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </Card>
          )}

          {/* Property List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {clients.find((c) => c.id === selectedClientId)?.name} - Properties
            </h2>
            <PropertyList
              key={refreshKey}
              clientId={selectedClientId}
              onEdit={handleEdit}
            />
          </div>
        </>
      )}

      {!selectedClientId && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            Please select a client above to manage their properties
          </p>
        </Card>
      )}
    </div>
  );
}
