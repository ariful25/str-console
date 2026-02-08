import { useState, useCallback } from 'react';

export function useBulkOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const processApprovals = useCallback(
    async (messageIds: string[], action: 'approve' | 'reject', reason?: string) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const response = await fetch('/api/bulk-operations/approvals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageIds,
            action,
            reason,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to process bulk operation');
        }

        const data = await response.json();
        setSuccess(`Successfully ${action} ${data.processed} messages`);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    processApprovals,
    clearMessages,
  };
}
