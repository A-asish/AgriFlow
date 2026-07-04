// src/features/admin/reports/hooks/useReports.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import adminService from '../../services/admin.api';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReports, setSelectedReports] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 5,
    hasNext: false,
    hasPrevious: false,
  });
  const [filters, setFilters] = useState({
    report_type: '',
    format: '',
    search: '',
    start_date: '',
    end_date: '',
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        page_size: pagination.perPage,
      };
      
      // Only add filters that have values
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      console.log('🔍 Fetching reports with params:', params);

      const response = await adminService.listReports(params);
      
      const responseData = response?.data || response;
      const reportsData = responseData?.reports || [];
      
      setReports(reportsData);

      if (responseData?.pagination) {
        setPagination({
          currentPage: responseData.pagination.current_page || 1,
          totalPages: responseData.pagination.total_pages || 1,
          totalItems: responseData.pagination.total_items || 0,
          perPage: responseData.pagination.per_page || 5,
          hasNext: responseData.pagination.has_next || false,
          hasPrevious: responseData.pagination.has_previous || false,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const refresh = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  }, [pagination.totalPages]);

  const handlePerPageChange = useCallback((newPerPage) => {
    setPagination(prev => ({
      ...prev,
      perPage: newPerPage,
      currentPage: 1,
    }));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const applyFilters = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  const clearFilters = useCallback(() => {
    setFilters({
      report_type: '',
      format: '',
      search: '',
      start_date: '',
      end_date: '',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setTimeout(() => fetchReports(), 100);
  }, [fetchReports]);

  const toggleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedReports(reports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  }, [reports]);

  const toggleSelectOne = useCallback((id) => {
    setSelectedReports(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedReports([]);
  }, []);

  return {
    reports,
    loading,
    selectedReports,
    pagination,
    filters,
    refresh,
    handlePageChange,
    handlePerPageChange,
    handleFilterChange,
    applyFilters,
    clearFilters,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
  };
};