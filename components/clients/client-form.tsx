'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useClients, Client } from '@/lib/hooks/useClients';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ClientFormProps {
  client?: Client;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [name, setName] = useState(client?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { createClient, updateClient } = useClients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Client name is required');
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (client) {
        result = await updateClient(client.id, name.trim());
      } else {
        result = await createClient(name.trim());
      }

      if (result) {
        setSuccess(true);
        setName('');
        setTimeout(() => {
          onSuccess?.();
        }, 800);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {client ? 'Edit Client' : 'Create New Client'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Client Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vacation Rentals Inc"
            disabled={submitting}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            {client ? 'Client updated successfully' : 'Client created successfully'}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {client ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              client ? 'Update Client' : 'Create Client'
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
