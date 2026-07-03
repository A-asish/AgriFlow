// src/features/admin/components/StatusBadge.jsx
import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          label: 'Active',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
      case 'inactive':
      case 'deceased':
        return {
          label: 'Inactive',
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'good':
        return {
          label: 'Good',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'fair':
        return {
          label: 'Fair',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
      case 'poor':
        return {
          label: 'Poor',
          icon: XCircle,
          className: 'bg-red-100 text-red-700 border-red-200'
        };
      default:
        return {
          label: status || 'Unknown',
          icon: Clock,
          className: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge className={`flex items-center gap-1 px-2 py-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

export default StatusBadge;