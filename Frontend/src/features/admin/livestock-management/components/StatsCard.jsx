// src/features/admin/livestock-management/components/StatsCard.jsx
import React from 'react';
import { Card } from '@/shared/components/ui/card';

const StatsCard = ({ title, value, icon: Icon, bgColor, textColor }) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;