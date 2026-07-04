// src/features/admin/reports/components/ReportFilters.jsx
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const ReportFilters = ({ filters, onFilterChange, onApply, onClear }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {Object.values(filters).some(v => v) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-600 hover:text-red-700 gap-1"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search reports..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-9 h-9 w-48 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
            />
          </div>
          <Button size="sm" onClick={onApply} className="bg-emerald-600 hover:bg-emerald-700">
            Apply
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
          <div>
            <Label className="text-xs font-medium">Report Type</Label>
            <Select
              value={filters.report_type}
              onValueChange={(v) => onFilterChange('report_type', v)}
            >
              <SelectTrigger className="h-9 text-sm mt-1">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="crop">Crop</SelectItem>
                <SelectItem value="livestock">Livestock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs font-medium">Format</Label>
            <Select
              value={filters.format}
              onValueChange={(v) => onFilterChange('format', v)}
            >
              <SelectTrigger className="h-9 text-sm mt-1">
                <SelectValue placeholder="All Formats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Formats</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs font-medium">Start Date</Label>
            <Input
              type="date"
              value={filters.start_date}
              onChange={(e) => onFilterChange('start_date', e.target.value)}
              className="h-9 text-sm mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs font-medium">End Date</Label>
            <Input
              type="date"
              value={filters.end_date}
              onChange={(e) => onFilterChange('end_date', e.target.value)}
              className="h-9 text-sm mt-1"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReportFilters;