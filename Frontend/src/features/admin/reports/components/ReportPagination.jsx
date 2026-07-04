// src/features/admin/reports/components/ReportPagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const ReportPagination = ({ 
  pagination, 
  onPageChange,
  onPerPageChange 
}) => {
  const { 
    currentPage, 
    totalPages, 
    totalItems, 
    perPage, 
    hasNext, 
    hasPrevious 
  } = pagination;
  
  if (totalPages <= 1 && totalItems <= perPage) return null;

  // Generate page numbers to display (show 5 page numbers at a time)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-200 gap-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Showing</span>
        <span className="font-medium text-slate-700">
          {totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1}
        </span>
        <span>to</span>
        <span className="font-medium text-slate-700">
          {Math.min(currentPage * perPage, totalItems)}
        </span>
        <span>of</span>
        <span className="font-medium text-slate-700">{totalItems}</span>
        <span>reports</span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Show:</span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!hasPrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          
          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 p-0 text-xs ${
                  pageNum === currentPage 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : ''
                }`}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          
          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNext}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPagination;