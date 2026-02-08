'use client';

import { useEffect, useState } from 'react';
import { useProperties, Property } from '@/lib/hooks/useProperties';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface PropertyFormProps {
  property?: Property;
  clientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropertyForm({
  property,
  clientId,
  onSuccess,
  onCancel,
}: PropertyFormProps) {
  const { toast } = useToast();
  const { createProperty, updateProperty, loading, error } = useProperties();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pmsAccountId: '',
    listingMapId: '',
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        address: property.address || '',
        pmsAccountId: property.pmsAccountId || '',
        listingMapId: property.listingMapId || '',
      });
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Property name is required',
        variant: 'destructive',
      });
      return;
    }

    if (property) {
      const success = await updateProperty(property.id, formData);
      if (success) {
        toast({
          title: 'Success',
          description: 'Property updated successfully',
        });
        onSuccess?.();
      }
    } else {
      if (!formData.pmsAccountId.trim() || !formData.listingMapId.trim()) {
        toast({
          title: 'Validation Error',
          description: 'PMS Account ID and Listing Map ID are required for new properties',
          variant: 'destructive',
        });
        return;
      }
      const success = await createProperty(clientId, formData.name, {
        address: formData.address,
        pmsAccountId: formData.pmsAccountId,
        listingMapId: formData.listingMapId,
      } as any);
      if (success) {
        toast({
          title: 'Success',
          description: 'Property created successfully',
        });
        setFormData({
          name: '',
          address: '',
          pmsAccountId: '',
          listingMapId: '',
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
          Property Name *
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Sunset Villa"
          required
        />
      </div>

      {!property && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PMS Account ID *
            </label>
            <Input
              type="text"
              name="pmsAccountId"
              value={formData.pmsAccountId}
              onChange={handleChange}
              placeholder="pms_xxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Map ID *
            </label>
            <Input
              type="text"
              name="listingMapId"
              value={formData.listingMapId}
              onChange={handleChange}
              placeholder="listing_123"
              required
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <Input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (property ? 'Updating...' : 'Creating...') : property ? 'Update Property' : 'Create Property'}
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
