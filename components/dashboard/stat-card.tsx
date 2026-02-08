'use client';

import { Card } from '@/components/ui/card';
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  description?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
};

const iconColorClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
};

export function StatCard({ label, value, icon, color = 'blue', description }: StatCardProps) {
  return (
    <Card className={`p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
          {description && <p className="text-xs mt-2 opacity-60">{description}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
