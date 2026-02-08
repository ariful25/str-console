'use client';

import { useEffect, useState } from 'react';
import { useAutoRules, AutoRule, CreateRuleInput } from '@/lib/hooks/useAutoRules';
import { RuleForm } from '@/components/auto-rules/rule-form';
import { RuleList } from '@/components/auto-rules/rule-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Property {
  id: string;
  name: string;
  address?: string;
}

export default function AutoRulesPage() {
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyNames, setPropertyNames] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoRule | null>(null);
  const { rules, loading, error, fetchRules, createRule, updateRule, deleteRule, toggleRule } =
    useAutoRules(clientId);

  // Get clientId from localStorage or URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlClientId = params.get('clientId');
    const storedClientId = localStorage.getItem('currentClientId');
    const id = urlClientId || storedClientId || '';

    if (id) {
      setClientId(id);
      localStorage.setItem('currentClientId', id);
    }
  }, []);

  // Fetch properties for display
  useEffect(() => {
    if (!clientId) return;

    fetch(`/api/properties-list?clientId=${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        // Create mapping of ID to name
        const nameMap = data.reduce(
          (acc: Record<string, string>, prop: Property) => {
            acc[prop.id] = prop.name;
            return acc;
          },
          {}
        );
        setPropertyNames(nameMap);
      })
      .catch((err) => console.error('Failed to load properties:', err));
  }, [clientId]);

  // Fetch rules when clientId changes
  useEffect(() => {
    if (clientId) {
      fetchRules();
    }
  }, [clientId, fetchRules]);

  const handleSubmit = async (formData: CreateRuleInput) => {
    try {
      if (editingRule) {
        await updateRule(editingRule.id, formData);
      } else {
        await createRule(formData);
      }
      setShowForm(false);
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = (rule: AutoRule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRule(null);
  };

  if (!clientId) {
    return (
      <Card className="p-6 bg-yellow-50 border-yellow-200 text-yellow-800">
        Loading client information...
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Rules</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create property-specific rules that automatically handle common guest scenarios
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRule(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Rule'}
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600">Active Rules</p>
          <p className="text-2xl font-bold text-blue-600">{rules.filter((r) => r.enabled).length}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-gray-600">Total Rules</p>
          <p className="text-2xl font-bold text-green-600">{rules.length}</p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-gray-600">Properties</p>
          <p className="text-2xl font-bold text-purple-600">{properties.length}</p>
        </Card>
      </div>

      {/* Form or List */}
      {showForm && (
        <RuleForm
          rule={editingRule || undefined}
          clientId={clientId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {error && (
        <Card className="p-4 bg-red-50 border-red-200 text-red-700">{error}</Card>
      )}

      {/* Rules List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Rules</h2>
        <RuleList
          rules={rules}
          loading={loading}
          propertyNames={propertyNames}
          onEdit={handleEdit}
          onDelete={deleteRule}
          onToggle={toggleRule}
        />
      </div>

      {/* Documentation */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-semibold mb-3">How Property-Scoped Rules Work</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-semibold min-w-fit">1. Property Scope:</span>
            <span>Each property can have unique rules. Leave empty for client-wide rules.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold min-w-fit">2. No Conflicts:</span>
            <span>
              Rules from Property A don't affect Property B. Each property's rules operate
              independently.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold min-w-fit">3. Trigger:</span>
            <span>Select guest message intent (checkin, checkout, complaint, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold min-w-fit">4. Action:</span>
            <span>
              Choose what happens: queue for review, suggest a template, or auto-send
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
