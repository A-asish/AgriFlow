// src/features/admin/crops-management/components/BulkActionBar.jsx
import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Trash2, X, Loader2 } from 'lucide-react';

const BulkActionBar = ({ 
  selectedCount, 
  onDelete,
  onClear,
  actionLoading = false 
}) => {
  return (
    <Card className="p-4 bg-red-50 border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold text-sm">
            {selectedCount}
          </div>
          <span className="font-medium text-red-900">
            {selectedCount} crop{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDelete}
            disabled={actionLoading}
            className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Selected
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClear}
            disabled={actionLoading}
            className="gap-2 text-gray-600"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BulkActionBar;