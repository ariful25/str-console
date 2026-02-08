'use client';

import { useEffect, useState } from 'react';
import { useMetrics, formatSeconds } from '@/lib/hooks/useMetrics';
import { Card } from '@/components/ui/card';
import { TrendingUp, MessageSquare, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtext,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: any;
  subtext?: string;
  color?: string;
}) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div
        className={`p-3 rounded-lg ${
          color === 'green'
            ? 'bg-green-100 text-green-600'
            : color === 'red'
              ? 'bg-red-100 text-red-600'
              : color === 'yellow'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-blue-100 text-blue-600'
        }`}
      >
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export default function MetricsPage() {
  const { metrics, loading, fetchMetrics } = useMetrics();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [mounted, fetchMetrics]);

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Metrics & Analytics</h1>
        <p className="text-gray-600 mt-2">System performance overview (last 30 days)</p>
      </div>

      {loading && !metrics && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading metrics...</p>
        </div>
      )}

      {metrics && (
        <div className="space-y-8">
          {/* Messages Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Message Volume
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Messages"
                value={metrics.messages.total.toLocaleString()}
                icon={MessageSquare}
                color="blue"
              />
              <StatCard
                title="This Month"
                value={metrics.messages.thisMonth.toLocaleString()}
                icon={TrendingUp}
                subtext={`Avg: ${Math.round(metrics.messages.thisMonth / 30)}/day`}
                color="blue"
              />
              <StatCard
                title="Today"
                value={metrics.messages.today.toLocaleString()}
                icon={MessageSquare}
                color="blue"
              />
            </div>
          </div>

          {/* Approvals Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} />
              Approval Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Requests"
                value={metrics.approvals.total.toLocaleString()}
                icon={CheckCircle2}
                color="blue"
              />
              <StatCard
                title="Approved"
                value={metrics.approvals.approved.toLocaleString()}
                icon={CheckCircle2}
                color="green"
              />
              <StatCard
                title="Rejected"
                value={metrics.approvals.rejected.toLocaleString()}
                icon={CheckCircle2}
                color="red"
              />
              <StatCard
                title="Pending"
                value={metrics.approvals.pending.toLocaleString()}
                icon={CheckCircle2}
                subtext={`${metrics.approvals.approvalRate}% approved`}
                color="yellow"
              />
            </div>
          </div>

          {/* Performance Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Avg Response Time"
                value={formatSeconds(metrics.performance.avgResponseTimeSeconds)}
                icon={Clock}
                subtext="From received to first action"
                color="blue"
              />
              <StatCard
                title="Avg Approval Time"
                value={formatSeconds(metrics.performance.avgApprovalTimeSeconds)}
                icon={Clock}
                subtext="From request to decision"
                color="blue"
              />
            </div>
          </div>

          {/* Risk Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Risk Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <StatCard
                title="High/Critical Risk This Month"
                value={metrics.risks.highRiskThisMonth.toLocaleString()}
                icon={AlertTriangle}
                color="red"
              />
            </div>
          </div>

          {/* Summary Stats */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-semibold text-lg mb-4">Quick Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.approvals.approvalRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(metrics.messages.thisMonth / 30)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.approvals.pending}</p>
              </div>
              <div>
                <p className="text-gray-600">High Risk %</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.messages.thisMonth > 0
                    ? Math.round(
                        (metrics.risks.highRiskThisMonth / metrics.messages.thisMonth) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
