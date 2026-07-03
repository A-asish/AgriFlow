// src/features/admin/livestock-management/components/Pagination.jsx
import React from 'react';
import { Button } from '@/shared/components/ui/button';

const Pagination = ({ pagination, onPageChange, loading }) => {
  if (pagination.total_pages <= 1) return null;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      onPageChange(newPage);
    }
  };

  const startIndex = (pagination.page - 1) * pagination.page_size + 1;
  const endIndex = Math.min(pagination.page * pagination.page_size, pagination.total);

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t flex-wrap gap-3">
      <div className="text-sm text-gray-500">
        Showing {startIndex} to {endIndex} of {pagination.total} animals
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1 || loading}
          className="h-8 text-xs"
        >
          Previous
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
            let pageNum;
            if (pagination.total_pages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.total_pages - 2) {
              pageNum = pagination.total_pages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }
            return pageNum && (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
                className={`h-8 w-8 text-xs ${pagination.page === pageNum ? "bg-emerald-600" : ""}`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.total_pages || loading}
          className="h-8 text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;