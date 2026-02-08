import { AutoRule } from '@/lib/hooks/useAutoRules';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface RuleListProps {
  rules: AutoRule[];
  loading: boolean;
  propertyNames?: Record<string, string>;
  onEdit: (rule: AutoRule) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
}

const INTENT_COLORS: Record<string, string> = {
  checkin: 'bg-blue-100 text-blue-800',
  checkout: 'bg-orange-100 text-orange-800',
  amenity: 'bg-green-100 text-green-800',
  complaint: 'bg-red-100 text-red-800',
  cancellation: 'bg-purple-100 text-purple-800',
  question: 'bg-gray-100 text-gray-800',
  appreciation: 'bg-pink-100 text-pink-800',
};

const ACTION_LABELS: Record<string, string> = {
  queue: '📋 Queue for Review',
  template: '💡 Suggest Template',
  auto_send: '🤖 Auto-Send',
};

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-50 border-green-200',
  medium: 'bg-yellow-50 border-yellow-200',
  high: 'bg-orange-50 border-orange-200',
  critical: 'bg-red-50 border-red-200',
};

export function RuleList({
  rules,
  loading,
  propertyNames = {},
  onEdit,
  onDelete,
  onToggle,
}: RuleListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    setDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    setToggling(id);
    try {
      await onToggle(id, !enabled);
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading rules...</div>;

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-gray-500 mb-4">No auto rules yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <Card
          key={rule.id}
          className={`p-4 border-l-4 transition ${
            rule.enabled ? RISK_COLORS[rule.riskMax || 'low'] : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {rule.intent && (
                  <Badge className={`${INTENT_COLORS[rule.intent] || 'bg-gray-100'}`}>
                    {rule.intent.toUpperCase()}
                  </Badge>
                )}
                <span className="text-sm font-medium">{ACTION_LABELS[rule.action] || rule.action}</span>
                {rule.riskMax && (
                  <span className="text-xs px-2 py-1 bg-white rounded border border-gray-300">
                    Risk: {rule.riskMax.toUpperCase()}
                  </span>
                )}
                {rule.propertyId && propertyNames[rule.propertyId] && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    📍 {propertyNames[rule.propertyId]}
                  </span>
                )}
                {!rule.propertyId && (
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                    📍 All Properties
                  </span>
                )}
              </div>

              {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                <div className="text-xs text-gray-600 ml-1">
                  Conditions: {JSON.stringify(rule.conditions, null, 2).slice(0, 100)}...
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                Created {new Date(rule.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(rule.id, rule.enabled)}
                disabled={toggling === rule.id}
                className={`px-3 py-1 text-sm rounded transition ${
                  rule.enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {toggling === rule.id ? '...' : rule.enabled ? 'ON' : 'OFF'}
              </button>

              <Button size="sm" variant="outline" onClick={() => onEdit(rule)}>
                Edit
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(rule.id)}
                disabled={deleting === rule.id}
              >
                {deleting === rule.id ? '...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
