// src/features/admin/livestock-management/components/GenderBadge.jsx
import React from 'react';
import { Badge } from '@/shared/components/ui/badge';

const GenderBadge = ({ gender }) => {
  const g = gender?.toLowerCase();
  if (g === 'male') {
    return (
      <Badge variant="outline" className="border-blue-300 text-blue-600 bg-blue-50">
        Male
      </Badge>
    );
  }
  if (g === 'female') {
    return (
      <Badge variant="outline" className="border-pink-300 text-pink-600 bg-pink-50">
        Female
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-gray-300 text-gray-600">
      Unknown
    </Badge>
  );
};

export default GenderBadge;