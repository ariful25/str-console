'use client';

import { useEffect, useState } from 'react';
import { useUsers, User } from '@/lib/hooks/useUsers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const roles = ['admin', 'manager', 'staff'];

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const { createUser, updateUser, loading, error } = useUsers();
  const [formData, setFormData] = useState({
    clerkId: '',
    email: '',
    name: '',
    role: 'staff',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        clerkId: user.clerkId || '',
        email: user.email || '',
        name: user.name || '',
        role: user.role || 'staff',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email and name are required',
        variant: 'destructive',
      });
      return;
    }

    if (user) {
      const success = await updateUser(user.id, {
        name: formData.name,
        role: formData.role,
      });
      if (success) {
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
        onSuccess?.();
      }
    } else {
      if (!formData.clerkId.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Clerk ID is required for new users',
          variant: 'destructive',
        });
        return;
      }
      const success = await createUser(
        formData.clerkId,
        formData.email,
        formData.name,
        formData.role
      );
      if (success) {
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        setFormData({
          clerkId: '',
          email: '',
          name: '',
          role: 'staff',
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

      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clerk ID *
          </label>
          <Input
            type="text"
            name="clerkId"
            value={formData.clerkId}
            onChange={handleChange}
            placeholder="user_xxxxx"
            required
            disabled={user ? true : false}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@example.com"
          required
          disabled={user ? true : false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role *
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (user ? 'Updating...' : 'Creating...') : user ? 'Update User' : 'Create User'}
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
