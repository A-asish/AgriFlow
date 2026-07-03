// src/features/admin/farmers-management/components/BulkActionBar.jsx
import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { CheckCircle, XCircle, Mail, Trash2, X, Users } from 'lucide-react';

const BulkActionBar = ({ 
  selectedCount, 
  onActivate, 
  onDeactivate, 
  onVerify, 
  onDelete,
  onClear 
}) => {
  return (
    <Card className="p-4 bg-emerald-50 border-emerald-200 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
            {selectedCount}
          </div>
          <span className="font-medium text-emerald-900">
            {selectedCount} farmer{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onActivate}
            className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="w-4 h-4" />
            Activate
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDeactivate}
            className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            <XCircle className="w-4 h-4" />
            Deactivate
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onVerify}
            className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Mail className="w-4 h-4" />
            Verify
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDelete}
            className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClear}
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