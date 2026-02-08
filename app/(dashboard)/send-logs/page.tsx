'use client';

import { useEffect, useState } from 'react';
import { useSendLogs, SendLogEntry, SendLogFilters } from '@/lib/hooks/useSendLogs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Mail,
  MessageSquare,
  Eye,
} from 'lucide-react';

export default function SendLogsPage() {
  const { logs, loading, error, pagination, fetchLogs } = useSendLogs();
  const [filters, setFilters] = useState<SendLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SendLogEntry | null>(null);

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

  const channels: { value: string; label: string; color: string }[] = [
    { value: 'pms', label: 'PMS', color: 'bg-blue-100 text-blue-800' },
    { value: 'email', label: 'Email', color: 'bg-green-100 text-green-800' },
    { value: 'sms', label: 'SMS', color: 'bg-purple-100 text-purple-800' },
    { value: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-100 text-emerald-800' },
  ];

  const getChannelColor = (channel: string) => {
    return channels.find((ch) => ch.value === channel)?.color || 'bg-gray-100 text-gray-800';
  };

  const getChannelLabel = (channel: string) => {
    return channels.find((ch) => ch.value === channel)?.label || channel.toUpperCase();
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
          <h2 className="text-2xl font-bold mb-6">Message Details</h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sent At</p>
              <p className="font-semibold">
                {new Date(selectedLog.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Channel</p>
              <Badge className={getChannelColor(selectedLog.channel)}>
                {getChannelLabel(selectedLog.channel)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Guest</p>
              <p className="font-semibold">{selectedLog.thread.guestName}</p>
              <p className="text-sm text-gray-600">{selectedLog.thread.guestEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Property</p>
              <p className="font-semibold">{selectedLog.thread.property.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Sent By</p>
              <p className="font-semibold">
                {selectedLog.sentByUser?.name || 'System'}
              </p>
              {selectedLog.sentByUser && (
                <p className="text-sm text-gray-600">{selectedLog.sentByUser.email}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">Final Reply</p>
            <Card className="p-4 bg-gray-50">
              <p className="text-sm whitespace-pre-wrap">{selectedLog.finalReply}</p>
            </Card>
          </div>

          {selectedLog.providerResponse && (
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-2">Provider Response</p>
              <Card className="p-4 bg-gray-50">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(selectedLog.providerResponse, null, 2)}
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
          <h1 className="text-3xl font-bold tracking-tight">Send Logs</h1>
          <p className="text-gray-600 mt-1">Track all messages sent through the system</p>
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
                <label className="text-sm font-medium block mb-2">Search Reply</label>
                <Input
                  placeholder="Search in message..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Channel</label>
                <select
                  className="w-full p-2 border rounded"
                  value={filters.channel || ''}
                  onChange={(e) => handleFilterChange('channel', e.target.value)}
                >
                  <option value="">All Channels</option>
                  {channels.map((ch) => (
                    <option key={ch.value} value={ch.value}>
                      {ch.label}
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
          icon={<Send className="h-5 w-5" />}
          label="Total Sent"
          value={pagination.total}
          color="blue"
        />
        <StatCard
          icon={<Mail className="h-5 w-5" />}
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
          icon={<MessageSquare className="h-5 w-5" />}
          label="Per Page"
          value={pagination.limit}
          color="orange"
        />
      </div>

      {/* Logs Table */}
      {loading ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">Loading send logs...</div>
        </Card>
      ) : error ? (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">Error: {error}</p>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Send className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No send logs found</p>
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
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold truncate">
                      {log.thread.guestName}
                    </p>
                    <Badge className={getChannelColor(log.channel)}>
                      {getChannelLabel(log.channel)}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {log.thread.property.name}
                  </p>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {log.finalReply}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.sentByUser?.name || 'System'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString()}
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
