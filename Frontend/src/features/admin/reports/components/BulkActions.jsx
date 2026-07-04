// src/features/admin/reports/components/BulkActions.jsx
import React from 'react';
import { Trash2, Download, FileText, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

const BulkActions = ({ 
  selectedCount, 
  onSelectAll, 
  onClearSelection, 
  allSelected,
  onBulkDelete,
  onBulkDownload,
  loading 
}) => {
  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="h-8 text-xs"
        >
          <CheckSquare className="w-3 h-3 mr-1" />
          Select All
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-medium">
        {selectedCount} selected
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
        className="h-8 text-xs"
      >
        <Square className="w-3 h-3 mr-1" />
        Clear
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
            <FileText className="w-3 h-3 mr-1" />
            Bulk Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onBulkDownload} disabled={loading} className="gap-2">
            <Download className="w-4 h-4" />
            Download All
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onBulkDelete} 
            disabled={loading} 
            className="gap-2 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BulkActions;