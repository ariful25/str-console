'use client';

import { useEffect } from 'react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusBreakdown } from '@/components/dashboard/status-breakdown';
import { TopClients } from '@/components/dashboard/top-clients';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  Users,
  Building2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { stats, loading, error, fetchStats } = useDashboard();

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your STR operations</p>
        </div>
        <Card className="p-8">
          <div className="text-center text-gray-500">Loading dashboard...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your STR operations</p>
        </div>
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-700">Error loading dashboard: {error}</p>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your STR operations</p>
        </div>
        <Card className="p-8">
          <div className="text-center text-gray-500">No data available</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your STR operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={stats.totalClients}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          description="Active property management clients"
        />
        <StatCard
          label="Total Properties"
          value={stats.totalProperties}
          icon={<Building2 className="h-6 w-6" />}
          color="green"
          description="Properties under management"
        />
        <StatCard
          label="Total Messages"
          value={stats.totalMessages}
          icon={<MessageSquare className="h-6 w-6" />}
          color="purple"
          description="Guest and staff messages"
        />
        <StatCard
          label="Active Conversations"
          value={stats.activeThreads}
          icon={<AlertCircle className="h-6 w-6" />}
          color="orange"
          description="Pending and open threads"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatusBreakdown
            pending={stats.threadsByStatus.pending}
            open={stats.threadsByStatus.open}
            resolved={stats.threadsByStatus.resolved}
            closed={stats.threadsByStatus.closed}
          />
        </div>

        <TopClients clients={stats.topClients} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity messages={stats.recentMessages} />
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Card className="p-4">
          <p className="text-2xl font-bold text-blue-600">
            {stats.threadsByStatus.pending}
          </p>
          <p className="text-xs text-gray-600 mt-1">Pending</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-blue-600">
            {stats.threadsByStatus.open}
          </p>
          <p className="text-xs text-gray-600 mt-1">Open</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">
            {stats.threadsByStatus.resolved}
          </p>
          <p className="text-xs text-gray-600 mt-1">Resolved</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-gray-600">
            {stats.threadsByStatus.closed}
          </p>
          <p className="text-xs text-gray-600 mt-1">Closed</p>
        </Card>
      </div>
    </div>
  );
}
