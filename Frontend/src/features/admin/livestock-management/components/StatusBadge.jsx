// src/features/admin/livestock-management/components/StatusBadge.jsx
import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, XCircle, Package, Activity } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === 'active') {
    return (
      <Badge className="flex items-center gap-1.5 bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3" />
        <span>Active</span>
      </Badge>
    );
  }
  if (s === 'sold') {
    return (
      <Badge className="flex items-center gap-1.5 bg-blue-100 text-blue-700 border-blue-200">
        <Package className="w-3 h-3" />
        <span>Sold</span>
      </Badge>
    );
  }
  if (s === 'dead') {
    return (
      <Badge className="flex items-center gap-1.5 bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3" />
        <span>Deceased</span>
      </Badge>
    );
  }
  if (s === 'butchered') {
    return (
      <Badge className="flex items-center gap-1.5 bg-purple-100 text-purple-700 border-purple-200">
        <Activity className="w-3 h-3" />
        <span>Butchered</span>
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-700">
      {status || 'Unknown'}
    </Badge>
  );
};

export default StatusBadge;