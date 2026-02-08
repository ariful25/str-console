'use client';

import { useState, useEffect } from 'react';
import { useBulkOperations } from '@/lib/hooks/useBulkOperations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function BulkOperationsPage() {
  const { loading, error, success, processApprovals } = useBulkOperations();
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState<'approve' | 'reject' | null>(null);
  const [messageIdInput, setMessageIdInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddMessage = () => {
    const id = messageIdInput.trim();
    if (id && !selectedMessages.includes(id)) {
      setSelectedMessages([...selectedMessages, id]);
      setMessageIdInput('');
    }
  };

  const handleRemoveMessage = (id: string) => {
    setSelectedMessages(selectedMessages.filter(m => m !== id));
  };

  const handleProcess = async (action: 'approve' | 'reject') => {
    if (selectedMessages.length === 0) return;

    try {
      await processApprovals(selectedMessages, action, reason || undefined);
      setSelectedMessages([]);
      setReason('');
      setShowConfirm(null);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSelectedMessages([]);
      }, 5000);
    } catch (err) {
      // Error is already set in hook
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk Operations</h1>
        <p className="text-gray-600 mt-2">Approve or reject multiple messages at once</p>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="mb-6 p-4 bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {success && (
        <Card className="mb-6 p-4 bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-600" size={20} />
            <p className="text-green-800">{success}</p>
          </div>
        </Card>
      )}

      {/* Input Section */}
      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Add Messages</h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Message ID</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter message ID (e.g., msg_123456)"
              value={messageIdInput}
              onChange={e => setMessageIdInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddMessage()}
              disabled={loading}
            />
            <Button
              onClick={handleAddMessage}
              disabled={!messageIdInput.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Optional Reason */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Reason (optional)</label>
          <Input
            placeholder="Why are you approving/rejecting these?"
            value={reason}
            onChange={e => setReason(e.target.value)}
            disabled={loading}
          />
        </div>
      </Card>

      {/* Selected Messages List */}
      {selectedMessages.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">
            Selected Messages ({selectedMessages.length})
          </h2>

          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {selectedMessages.map(id => (
              <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <code className="text-sm text-blue-600">{id}</code>
                <button
                  onClick={() => handleRemoveMessage(id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={loading}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Confirmation Dialog */}
          {showConfirm ? (
            <div className="p-4 bg-gray-50 rounded border-2 border-yellow-300 mb-4">
              <p className="text-sm font-semibold mb-3">
                Confirm {showConfirm === 'approve' ? 'APPROVE' : 'REJECT'} {selectedMessages.length}{' '}
                message{selectedMessages.length !== 1 ? 's' : ''}?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleProcess(showConfirm)}
                  disabled={loading}
                  className={
                    showConfirm === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }
                >
                  {loading ? 'Processing...' : 'Yes, Confirm'}
                </Button>
                <Button
                  onClick={() => setShowConfirm(null)}
                  disabled={loading}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirm('approve')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve All
              </Button>
              <Button
                onClick={() => setShowConfirm('reject')}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject All
              </Button>
              <Button
                onClick={() => setSelectedMessages([])}
                disabled={loading}
                variant="outline"
              >
                Clear
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!loading && selectedMessages.length === 0 && !success && (
        <Card className="p-12 text-center bg-gray-50">
          <CheckCircle2 size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Add message IDs to get started</p>
        </Card>
      )}
    </div>
  );
}
