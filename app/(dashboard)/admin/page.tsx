'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Shield, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Settings,
  Database,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  usersByRole: { role: string; count: number }[];
  totalMessages: number;
  totalApprovals: number;
  pendingApprovals: number;
  totalClients: number;
  totalProperties: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  actorName: string | null;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and administration</p>
        </div>
        <div className="text-center py-12 text-gray-500">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800',
    staff: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and administration</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          label="Total Users"
          value={stats?.totalUsers || 0}
          href="/users"
        />
        <StatCard
          icon={<MessageSquare className="h-6 w-6 text-green-600" />}
          label="Messages"
          value={stats?.totalMessages || 0}
          href="/inbox"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
          label="Approvals"
          value={stats?.totalApprovals || 0}
          href="/approvals"
          badge={
            stats?.pendingApprovals ? (
              <Badge variant="destructive">{stats.pendingApprovals} pending</Badge>
            ) : undefined
          }
        />
        <StatCard
          icon={<Database className="h-6 w-6 text-orange-600" />}
          label="Clients"
          value={stats?.totalClients || 0}
          href="/clients"
        />
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              Users by Role
            </h2>
            <Link href="/users">
              <Button variant="outline" size="sm">
                Manage Users
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.usersByRole && stats.usersByRole.length > 0 ? (
              stats.usersByRole.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[item.role]}>
                      {item.role}
                    </Badge>
                  </div>
                  <span className="text-2xl font-bold text-gray-700">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No users found</p>
            )}
          </div>
        </Card>

        {/* System Health */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              System Health
            </h2>
          </div>
          <div className="space-y-3">
            <HealthItem
              label="Database"
              status="operational"
              icon={<Database className="h-4 w-4" />}
            />
            <HealthItem
              label="Authentication"
              status="operational"
              icon={<Shield className="h-4 w-4" />}
            />
            <HealthItem
              label="API Services"
              status="operational"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <HealthItem
              label="OpenAI Integration"
              status={process.env.NEXT_PUBLIC_OPENAI_ENABLED === 'true' ? 'operational' : 'disabled'}
              icon={<MessageSquare className="h-4 w-4" />}
            />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Recent Activity
          </h2>
          <Link href="/audit-logs">
            <Button variant="outline" size="sm">
              View All Logs
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.actorName || 'System'}
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm py-4 text-center">No recent activity</p>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/users">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/auto-rules">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Configure Rules
            </Button>
          </Link>
          <Link href="/audit-logs">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              View Audit Logs
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
  badge?: React.ReactNode;
}

function StatCard({ icon, label, value, href, badge }: StatCardProps) {
  const content = (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            {icon}
            <span>{label}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</div>
          {badge && <div className="mt-2">{badge}</div>}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

interface HealthItemProps {
  label: string;
  status: 'operational' | 'degraded' | 'disabled';
  icon: React.ReactNode;
}

function HealthItem({ label, status, icon }: HealthItemProps) {
  const statusColors = {
    operational: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    disabled: 'bg-gray-100 text-gray-600',
  };

  const statusLabels = {
    operational: 'Operational',
    degraded: 'Degraded',
    disabled: 'Disabled',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    </div>
  );
}
