// src/features/admin/livestock-management/components/BulkActionBar.jsx
import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Trash2 } from 'lucide-react';

const BulkActionBar = ({ selectedCount, onDelete, onClear }) => {
  return (
    <Card className="p-4 bg-red-50 border-red-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold text-sm">
            {selectedCount}
          </div>
          <span className="font-medium text-red-900">
            {selectedCount} animal{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDelete}
            className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClear}
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BulkActionBar;