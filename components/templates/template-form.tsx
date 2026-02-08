'use client';

import { useEffect, useState } from 'react';
import { useTemplates, Template } from '@/lib/hooks/useTemplates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface TemplateFormProps {
  template?: Template;
  clientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const intents = [
  'checkin',
  'checkout',
  'question',
  'complaint',
  'cancellation',
  'booking_inquiry',
  'maintenance',
  'amenity_request',
  'other',
];

export function TemplateForm({
  template,
  clientId,
  onSuccess,
  onCancel,
}: TemplateFormProps) {
  const { toast } = useToast();
  const { createTemplate, updateTemplate, loading, error } = useTemplates();
  const [formData, setFormData] = useState({
    label: '',
    intent: 'question',
    text: '',
  });

  useEffect(() => {
    if (template) {
      setFormData({
        label: template.label || '',
        intent: template.intent || 'question',
        text: template.text || '',
      });
    }
  }, [template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim() || !formData.text.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template label and text are required',
        variant: 'destructive',
      });
      return;
    }

    if (template) {
      const success = await updateTemplate(template.id, {
        label: formData.label,
        text: formData.text,
      });
      if (success) {
        toast({
          title: 'Success',
          description: 'Template updated successfully',
        });
        onSuccess?.();
      }
    } else {
      const success = await createTemplate(
        clientId || null,
        formData.intent,
        formData.label,
        formData.text,
        true
      );
      if (success) {
        toast({
          title: 'Success',
          description: 'Template created successfully',
        });
        setFormData({
          label: '',
          intent: 'question',
          text: '',
        });
        onSuccess?.();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template Label *
        </label>
        <Input
          type="text"
          name="label"
          value={formData.label}
          onChange={handleChange}
          placeholder="e.g., Check-in Instructions"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Intent (When to use this template) *
        </label>
        <select
          name="intent"
          value={formData.intent}
          onChange={handleChange}
          disabled={!!template}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          {intents.map((intent) => (
            <option key={intent} value={intent}>
              {intent.charAt(0).toUpperCase() + intent.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
        {template && (
          <p className="text-xs text-gray-500 mt-1">Intent cannot be changed after creation</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template Text *
        </label>
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          placeholder="Write your template message here... You can use {guestName}, {propertyName}, {checkInDate} as variables."
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          Tip: Use variables like {'{guestName}'}, {'{propertyName}'}, {'{checkInDate}'} in your template
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (template ? 'Updating...' : 'Creating...') : template ? 'Update Template' : 'Create Template'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
