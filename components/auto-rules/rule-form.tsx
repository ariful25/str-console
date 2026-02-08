import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutoRule, CreateRuleInput } from '@/lib/hooks/useAutoRules';
import { useToast } from '@/components/ui/use-toast';

interface Property {
  id: string;
  name: string;
  address?: string;
}

interface RuleFormProps {
  rule?: AutoRule;
  clientId: string;
  onSubmit: (rule: CreateRuleInput) => Promise<void>;
  onCancel: () => void;
}

const INTENTS = ['checkin', 'checkout', 'amenity', 'complaint', 'cancellation', 'question', 'appreciation'];
const ACTIONS = [
  { value: 'queue', label: 'Queue for Review' },
  { value: 'template', label: 'Suggest Template' },
  { value: 'auto_send', label: 'Auto-Send Template' },
];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

export function RuleForm({ rule, clientId, onSubmit, onCancel }: RuleFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRuleInput>({
    propertyId: rule?.propertyId || '',
    intent: rule?.intent || '',
    riskMax: rule?.riskMax || 'low',
    action: rule?.action || 'queue',
    conditions: rule?.conditions || {},
  });

  // Fetch properties
  useEffect(() => {
    if (!clientId) return;
    
    setPropertiesLoading(true);
    fetch(`/api/properties-list?clientId=${clientId}`)
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .catch((err) => console.error('Failed to load properties:', err))
      .finally(() => setPropertiesLoading(false));
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.intent) {
        toast({ title: 'Error', description: 'Intent is required' });
        return;
      }

      if (formData.action === 'template' || formData.action === 'auto_send') {
        if (!formData.templateId) {
          toast({ title: 'Error', description: 'Template is required for this action' });
          return;
        }
      }

      await onSubmit(formData);
      toast({ title: 'Success', description: `Rule ${rule ? 'updated' : 'created'}` });
      onCancel();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save rule',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">{rule ? 'Edit Rule' : 'New Auto Rule'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Property (Optional)</label>
          <select
            value={formData.propertyId || ''}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value || undefined })}
            className="w-full px-3 py-2 border rounded-md bg-white"
            disabled={propertiesLoading}
          >
            <option value="">
              {propertiesLoading ? 'Loading properties...' : 'All Properties (Client-Wide)'}
            </option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name} {prop.address ? `- ${prop.address}` : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to apply rule to all properties. Select specific property to limit scope.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Intent */}
          <div>
            <label className="block text-sm font-medium mb-1">Intent (Trigger)</label>
            <select
              value={formData.intent || ''}
              onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-white"
              required
            >
              <option value="">Select intent...</option>
              {INTENTS.map((intent) => (
                <option key={intent} value={intent}>
                  {intent.charAt(0).toUpperCase() + intent.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Maximum */}
          <div>
            <label className="block text-sm font-medium mb-1">Max Risk Level</label>
            <select
              value={formData.riskMax || 'low'}
              onChange={(e) => setFormData({ ...formData, riskMax: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-white"
            >
              {RISK_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action */}
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <select
            value={formData.action}
            onChange={(e) =>
              setFormData({
                ...formData,
                action: e.target.value as any,
                templateId: e.target.value === 'queue' ? undefined : formData.templateId,
              })
            }
            className="w-full px-3 py-2 border rounded-md bg-white"
          >
            {ACTIONS.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.action === 'queue'
              ? 'Flag message for staff review'
              : formData.action === 'template'
                ? 'Suggest a template response'
                : 'Send template automatically'}
          </p>
        </div>

        {/* Template selection (if needed) */}
        {(formData.action === 'template' || formData.action === 'auto_send') && (
          <div>
            <label className="block text-sm font-medium mb-1">Template ID</label>
            <Input
              type="text"
              placeholder="Template ID or name"
              value={formData.templateId || ''}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.action === 'auto_send' && 'Requires approval before sending'}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : `${rule ? 'Update' : 'Create'} Rule`}
          </Button>
        </div>
      </form>
    </Card>
  );
}
