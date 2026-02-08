'use client';

import { useEffect, useState } from 'react';
import { useTemplates, Template } from '@/lib/hooks/useTemplates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

interface TemplateListProps {
  clientId: string;
  onEdit?: (template: Template) => void;
  refreshKey?: number;
}

const intentColors: Record<string, string> = {
  checkin: 'bg-green-100 text-green-800',
  checkout: 'bg-purple-100 text-purple-800',
  question: 'bg-blue-100 text-blue-800',
  complaint: 'bg-red-100 text-red-800',
  cancellation: 'bg-orange-100 text-orange-800',
  booking_inquiry: 'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-pink-100 text-pink-800',
  amenity_request: 'bg-cyan-100 text-cyan-800',
  other: 'bg-gray-100 text-gray-800',
};

export function TemplateList({ clientId, onEdit, refreshKey }: TemplateListProps) {
  const { templates, loading, error, fetchTemplates, deleteTemplate, updateTemplate } = useTemplates();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates(clientId);
  }, [clientId, fetchTemplates, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setDeleting(id);
    await deleteTemplate(id);
    setDeleting(null);
  };

  const handleToggleActive = async (template: Template) => {
    setToggling(template.id);
    await updateTemplate(template.id, { isActive: !template.isActive });
    setToggling(null);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Loading templates...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <p className="text-red-700">Error loading templates: {error}</p>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No templates yet. Create one to get started!</p>
        </div>
      </Card>
    );
  }

  // Group templates by intent
  const groupedTemplates = templates.reduce((acc, template) => {
    const intent = template.intent || 'other';
    if (!acc[intent]) acc[intent] = [];
    acc[intent].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTemplates).map(([intent, intentTemplates]) => (
        <div key={intent}>
          <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
            <Badge className={intentColors[intent]}>
              {intent.replace('_', ' ')}
            </Badge>
            <span className="text-gray-400 text-sm">
              ({intentTemplates.length} template{intentTemplates.length !== 1 ? 's' : ''})
            </span>
          </h3>
          <div className="space-y-2">
            {intentTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={onEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                isDeleting={deleting === template.id}
                isToggling={toggling === template.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  onEdit?: (template: Template) => void;
  onDelete: (id: string) => void;
  onToggleActive: (template: Template) => void;
  isDeleting: boolean;
  isToggling: boolean;
}

function TemplateCard({ template, onEdit, onDelete, onToggleActive, isDeleting, isToggling }: TemplateCardProps) {
  return (
    <Card className={`p-4 ${template.isActive ? 'hover:bg-gray-50' : 'bg-gray-100 opacity-60'} transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg truncate">{template.label}</h3>
            {!template.isActive && (
              <Badge variant="outline" className="text-gray-500">
                Inactive
              </Badge>
            )}
            {template.client && (
              <Badge variant="secondary" className="text-xs">
                Client-specific
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2 font-mono">{template.text}</p>
          <p className="text-xs text-gray-500">
            Created {new Date(template.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(template)}
            disabled={isToggling}
            title={template.isActive ? 'Deactivate template' : 'Activate template'}
          >
            {template.isActive ? (
              <ToggleRight className="h-4 w-4 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(template)}
            title="Edit template"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(template.id)}
            disabled={isDeleting}
            title="Delete template"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
