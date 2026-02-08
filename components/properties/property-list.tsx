'use client';

import { useEffect, useState } from 'react';
import { useProperties, Property } from '@/lib/hooks/useProperties';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Home } from 'lucide-react';

interface PropertyListProps {
  clientId: string;
  onEdit?: (property: Property) => void;
}

export function PropertyList({ clientId, onEdit }: PropertyListProps) {
  const { properties, loading, error, fetchProperties, deleteProperty } = useProperties();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties(clientId);
  }, [clientId, fetchProperties]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    setDeleting(id);
    const success = await deleteProperty(id);
    setDeleting(null);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Loading properties...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <p className="text-red-700">Error loading properties: {error}</p>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No properties yet. Create one to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onEdit={onEdit}
          onDelete={handleDelete}
          isDeleting={deleting === property.id}
        />
      ))}
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function PropertyCard({ property, onEdit, onDelete, isDeleting }: PropertyCardProps) {
  const threads = property._count?.threads || 0;
  const autoRules = property._count?.autoRules || 0;
  const location = property.address || '';

  return (
    <Card className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{property.name}</h3>
          {location && (
            <p className="text-sm text-gray-600 truncate">{location}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {threads} {threads === 1 ? 'conversation' : 'conversations'}
            </Badge>
            <Badge variant="outline">
              {autoRules} {autoRules === 1 ? 'rule' : 'rules'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Created {new Date(property.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(property)}
            title="Edit property"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(property.id)}
            disabled={isDeleting}
            title="Delete property"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
