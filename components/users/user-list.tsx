'use client';

import { useEffect, useState } from 'react';
import { useUsers, User } from '@/lib/hooks/useUsers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Users } from 'lucide-react';

interface UserListProps {
  onEdit?: (user: User) => void;
}

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
};

export function UserList({ onEdit }: UserListProps) {
  const { users, loading, error, fetchUsers, deleteUser } = useUsers();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    setDeleting(id);
    const success = await deleteUser(id);
    setDeleting(null);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">Loading users...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border border-red-200">
        <p className="text-red-700">Error loading users: {error}</p>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No users yet. Create one to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={handleDelete}
          isDeleting={deleting === user.id}
        />
      ))}
    </div>
  );
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function UserCard({ user, onEdit, onDelete, isDeleting }: UserCardProps) {
  const approvalCount = user._count?.approvals || 0;
  const auditCount = user._count?.auditLogs || 0;

  return (
    <Card className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{user.name}</h3>
            <Badge className={roleColors[user.role as keyof typeof roleColors]}>
              {user.role}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {approvalCount} {approvalCount === 1 ? 'approval' : 'approvals'}
            </Badge>
            <Badge variant="outline">
              {auditCount} {auditCount === 1 ? 'activity' : 'activities'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Created {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(user)}
            title="Edit user"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user.id)}
            disabled={isDeleting}
            title="Delete user"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
