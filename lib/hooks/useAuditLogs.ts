import { useState, useCallback } from 'react';

export interface AuditLogEntry {
  id: string;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  meta?: Record<string, any>;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Common actions that get logged
export const COMMON_ACTIONS = [
  'create_user',
  'update_user',
  'delete_user',
  'create_client',
  'update_client',
  'delete_client',
  'create_property',
  'update_property',
  'delete_property',
  'create_rule',
  'update_rule',
  'delete_rule',
  'create_template',
  'update_template',
  'delete_template',
  'approve_message',
  'reject_message',
  'send_message',
  'login',
  'logout',
];

// Entity types that can be audited
export const ENTITY_TYPES = [
  'User',
  'Client',
  'Property',
  'Message',
  'ApprovalRequest',
  'AutoRule',
  'Template',
  'KbEntry',
];

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
    hasMore: false,
  });

  const fetchLogs = useCallback(
    async (filters: AuditLogFilters = {}, page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '50');

        if (filters.userId) params.set('userId', filters.userId);
        if (filters.action) params.set('action', filters.action);
        if (filters.entityType) params.set('entityType', filters.entityType);
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
        if (filters.search) params.set('search', filters.search);

        const response = await fetch(`/api/audit-logs?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch audit logs');
        }

        const data = await response.json();

        setLogs(data.results);
        setPagination(data.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    logs,
    loading,
    error,
    pagination,
    fetchLogs,
  };
}
