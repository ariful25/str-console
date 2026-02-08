'use client';

import { useEffect, useState } from 'react';
import {
  useAuditLogs,
  AuditLogEntry,
  AuditLogFilters,
  COMMON_ACTIONS,
  ENTITY_TYPES,
} from '@/lib/hooks/useAuditLogs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Activity,
  Eye,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  Key,
  BookOpen,
  Zap,
} from 'lucide-react';

export default function AuditLogsPage() {
  const { logs, loading, error, pagination, fetchLogs } = useAuditLogs();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    fetchLogs(filters, 1);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    fetchLogs(filters, 1);
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchLogs({}, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchLogs(filters, newPage);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <Plus className="h-4 w-4" />;
    if (action.includes('update')) return <Edit2 className="h-4 w-4" />;
    if (action.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (action.includes('approve')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('reject')) return <XCircle className="h-4 w-4" />;
    if (action.includes('send')) return <Send className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('approve')) return 'bg-emerald-100 text-emerald-800';
    if (action.includes('reject')) return 'bg-orange-100 text-orange-800';
    if (action.includes('send')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getEntityIcon = (entityType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      User: <User className="h-4 w-4" />,
      Client: <User className="h-4 w-4" />,
      Property: <Key className="h-4 w-4" />,
      Message: <Send className="h-4 w-4" />,
      Template: <BookOpen className="h-4 w-4" />,
      AutoRule: <Zap className="h-4 w-4" />,
      KbEntry: <BookOpen className="h-4 w-4" />,
    };
    return iconMap[entityType] || <Activity className="h-4 w-4" />;
  };

  if (selectedLog) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedLog(null)}
          className="mb-4"
        >
          ← Back to Logs
        </Button>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Activity Details</h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Timestamp</p>
              <p className="font-semibold">
                {new Date(selectedLog.timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Action</p>
              <div className="flex items-center gap-2">
                {getActionIcon(selectedLog.action)}
                <Badge className={getActionColor(selectedLog.action)}>
                  {selectedLog.action}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Entity Type</p>
              <div className="flex items-center gap-2">
                {getEntityIcon(selectedLog.entityType)}
                <span className="font-semibold">{selectedLog.entityType}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Entity ID</p>
              <p className="font-mono text-sm">{selectedLog.entityId}</p>
            </div>
            {selectedLog.actor && (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Performed By</p>
                  <p className="font-semibold">{selectedLog.actor.name}</p>
                  <p className="text-sm text-gray-600">{selectedLog.actor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">User Role</p>
                  <Badge variant="secondary">{selectedLog.actor.role}</Badge>
                </div>
              </>
            )}
          </div>

          {selectedLog.details && (
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-2">Details</p>
              <Card className="p-4 bg-gray-50">
                <p className="text-sm whitespace-pre-wrap">{selectedLog.details}</p>
              </Card>
            </div>
          )}

          {selectedLog.meta && Object.keys(selectedLog.meta).length > 0 && (
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-2">Metadata</p>
              <Card className="p-4 bg-gray-50">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(selectedLog.meta, null, 2)}
                </pre>
              </Card>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Complete activity trail for compliance and monitoring</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-medium">Filters</span>
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary">{Object.keys(filters).length} active</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Action</label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <option value="">All Actions</option>
                  {COMMON_ACTIONS.map((act) => (
                    <option key={act} value={act}>
                      {act.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Entity Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.entityType || ''}
                  onChange={(e) => handleFilterChange('entityType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">From Date</label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">To Date</label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm font-medium block mb-2">Search</label>
                <Input
                  placeholder="Search action or details..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex-1"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Total Activities"
          value={pagination.total}
          color="blue"
        />
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          label="This Page"
          value={logs.length}
          color="green"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Page"
          value={`${pagination.page} of ${pagination.totalPages}`}
          color="purple"
        />
        <StatCard
          icon={<User className="h-5 w-5" />}
          label="Per Page"
          value={pagination.limit}
          color="orange"
        />
      </div>

      {/* Logs */}
      {loading ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">Loading audit logs...</div>
        </Card>
      ) : error ? (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No audit logs found</p>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card
              key={log.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {getActionIcon(log.action)}
                    </div>
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getEntityIcon(log.entityType)}
                      {log.entityType}
                    </Badge>
                  </div>

                  {log.details && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {log.details}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.actor?.name || 'System'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {log.entityId.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLog(log);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === pagination.page;
              const isVisible =
                Math.abs(pageNum - pagination.page) < 3 ||
                pageNum === 1 ||
                pageNum === pagination.totalPages;

              if (!isVisible && Math.abs(pageNum - pagination.page) === 3) {
                return <span key={`ellipsis-${i}`}>...</span>;
              }

              if (!isVisible) return null;

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasMore}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <Card className={`p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className={colorClasses[color]}>{icon}</div>
        <div>
          <p className="text-xs font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
