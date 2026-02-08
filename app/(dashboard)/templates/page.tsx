'use client';

import { useEffect, useState } from 'react';
import { useClients } from '@/lib/hooks/useClients';
import { TemplateForm } from '@/components/templates/template-form';
import { TemplateList } from '@/components/templates/template-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Template } from '@/lib/hooks/useTemplates';

export default function TemplatesPage() {
  const { clients, fetchClients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTemplate(undefined);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-gray-600 mt-1">Create reusable message templates for your clients</p>
        </div>
        {selectedClientId && !showForm && (
          <Button onClick={() => setShowForm(true)} size="lg">
            + New Template
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
          <option value="">Choose a client to manage their templates...</option>
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
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TemplateForm
                template={editingTemplate}
                clientId={selectedClientId}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </Card>
          )}

          {/* Template List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {clients.find((c) => c.id === selectedClientId)?.name} - Templates
            </h2>
            <TemplateList
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
            Please select a client above to manage their templates
          </p>
        </Card>
      )}
    </div>
  );
}
