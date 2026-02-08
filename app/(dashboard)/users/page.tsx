'use client';

import { useState } from 'react';
import { UserForm } from '@/components/users/user-form';
import { UserList } from '@/components/users/user-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { User } from '@/lib/hooks/useUsers';

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(undefined);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-gray-600 mt-1">Manage team members and their access levels</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="lg">
            + New User
          </Button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <UserForm
            user={editingUser}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </Card>
      )}

      {/* User List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Users</h2>
        <UserList key={refreshKey} onEdit={handleEdit} />
      </div>
    </div>
  );
}
