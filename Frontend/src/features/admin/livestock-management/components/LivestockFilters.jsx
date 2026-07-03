// src/features/admin/livestock-management/components/LivestockFilters.jsx
import React from 'react';
import { Card } from '@/shared/components/ui/card';

const LivestockFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch, 
  typeFilter, 
  onTypeChange, 
  statusFilter, 
  onStatusChange, 
  genderFilter, 
  onGenderChange, 
  onReset, 
  typeOptions, 
  statusOptions, 
  genderOptions, 
  hasActiveFilters 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, tag number, or farmer..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={onSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm">
            Search
          </button>
          {hasActiveFilters && (
            <button onClick={onReset} className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm">
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={typeFilter || 'all'}
            onChange={(e) => onTypeChange(e.target.value === 'all' ? '' : e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={statusFilter || 'all'}
            onChange={(e) => onStatusChange(e.target.value === 'all' ? '' : e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={genderFilter || 'all'}
            onChange={(e) => onGenderChange(e.target.value === 'all' ? '' : e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};

export default LivestockFilters;