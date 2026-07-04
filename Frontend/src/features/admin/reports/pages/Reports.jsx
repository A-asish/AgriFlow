// src/features/admin/reports/pages/Reports.jsx
import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { RefreshCw, Loader2, Filter, X, Download, FileText, Users, Wallet, Sprout, Beef, Calendar, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

import { useReports } from '../hooks/useReports';
import ReportHistoryTable from '../components/ReportHistoryTable';
import ReportPagination from '../components/ReportPagination';
import BulkActions from '../components/BulkActions';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import adminService from '../../services/admin.api';

const Reports = () => {
  const {
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
  } = useReports();

  const [generating, setGenerating] = useState(false);
  const [customReport, setCustomReport] = useState({
    format: 'csv',
    include_details: true,
    date_range_start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    date_range_end: new Date().toISOString().split('T')[0],
    include_farmers: true,
    include_crops: false,
    include_livestock: false,
    include_finance: false,
  });
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const reportTemplates = [
    { id: 'farmer', title: 'Farmer Registry', description: 'Complete list of registered farmers', icon: Users, color: 'text-blue-500 bg-blue-50', filename: 'farmers_report' },
    { id: 'financial', title: 'Financial Summary', description: 'Income and expense records', icon: Wallet, color: 'text-emerald-500 bg-emerald-50', filename: 'financial_report' },
    { id: 'crop', title: 'Cultivation Metrics', description: 'Growth stages and yield tracking', icon: Sprout, color: 'text-amber-500 bg-amber-50', filename: 'crops_report' },
    { id: 'livestock', title: 'Livestock Stats', description: 'Animal inventory and health records', icon: Beef, color: 'text-purple-500 bg-purple-50', filename: 'livestock_report' },
  ];

  const getFileExtension = (format) => {
    switch (format) {
      case 'excel': return 'xlsx';
      case 'pdf': return 'pdf';
      default: return 'csv';
    }
  };

  const handleGenerateReport = async (reportType, format, filename, customStart, customEnd) => {
    setGenerating(true);
    const startDate = customStart || customReport.date_range_start;
    const endDate = customEnd || customReport.date_range_end;
    const loadingToast = toast.loading(`Generating ${reportType} report...`);
    
    try {
      const response = await adminService.generateReport({
        report_type: reportType,
        format: format,
        date_range_start: startDate,
        date_range_end: endDate,
        include_details: customReport.include_details,
      });
      
      toast.dismiss(loadingToast);
      
      if (response.data instanceof Blob) {
        if (response.data.type === 'application/json') {
          const text = await response.data.text();
          try {
            const errorData = JSON.parse(text);
            if (errorData.error) {
              toast.error(errorData.error);
              return;
            }
          } catch (e) {}
        }
        
        const fileExt = getFileExtension(format);
        const downloadFilename = `${filename}_${startDate}_to_${endDate}.${fileExt}`;
        
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded!`);
        setTimeout(() => refresh(), 500);
      } else if (response.data?.error) {
        toast.error(response.data.error);
      } else {
        toast.error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.dismiss(loadingToast);
      
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.error || 'Failed to generate report');
        } catch (e) {
          toast.error('Failed to generate report');
        }
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to generate report');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCustomReport = async () => {
    const selectedModules = [];
    if (customReport.include_farmers) selectedModules.push({ type: 'farmer', filename: 'farmers_report' });
    if (customReport.include_crops) selectedModules.push({ type: 'crop', filename: 'crops_report' });
    if (customReport.include_livestock) selectedModules.push({ type: 'livestock', filename: 'livestock_report' });
    if (customReport.include_finance) selectedModules.push({ type: 'financial', filename: 'financial_report' });
    
    if (selectedModules.length === 0) {
      toast.error('Please select at least one module');
      return;
    }
    
    setGenerating(true);
    const loadingToast = toast.loading(`Generating ${selectedModules.length} report(s)...`);
    
    try {
      for (const module of selectedModules) {
        const response = await adminService.generateReport({
          report_type: module.type,
          format: customReport.format,
          date_range_start: customReport.date_range_start,
          date_range_end: customReport.date_range_end,
          include_details: customReport.include_details,
        });
        
        if (response.data instanceof Blob) {
          const fileExt = getFileExtension(customReport.format);
          const downloadFilename = `${module.filename}_${customReport.date_range_start}_to_${customReport.date_range_end}.${fileExt}`;
          
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', downloadFilename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
      }
      
      toast.dismiss(loadingToast);
      toast.success(`${selectedModules.length} report(s) downloaded!`);
      setTimeout(() => refresh(), 500);
    } catch (error) {
      console.error('Error generating custom report:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate custom report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    if (report.file) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin + '/api/';
      const host = apiBase.endsWith('/api/') ? apiBase.slice(0, -5) : apiBase;
      const url = `${host}${report.file.startsWith('/') ? '' : '/'}${report.file}`;
      window.open(url, '_blank');
    } else if (report.report_type && report.format && report.filters) {
      handleGenerateReport(
        report.report_type, 
        report.format, 
        `${report.report_type}_report`, 
        report.filters.start_date, 
        report.filters.end_date
      );
    } else {
      toast.info('No file available for this report');
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      await adminService.deleteReport(reportToDelete.id);
      toast.success('Report deleted successfully');
      setShowDeleteDialog(false);
      setReportToDelete(null);
      setTimeout(() => refresh(), 300);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReports.length === 0) {
      toast.warning('No reports selected');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedReports.length} report(s)? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    setBulkActionLoading(true);
    const loadingToast = toast.loading(`Deleting ${selectedReports.length} report(s)...`);
    
    try {
      await Promise.all(selectedReports.map(id => adminService.deleteReport(id)));
      toast.dismiss(loadingToast);
      toast.success(`${selectedReports.length} report(s) deleted successfully`);
      clearSelection();
      setTimeout(() => refresh(), 300);
    } catch (error) {
      console.error('Error deleting reports:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to delete some reports');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedReports.length === 0) {
      toast.warning('No reports selected');
      return;
    }

    setBulkActionLoading(true);
    const loadingToast = toast.loading(`Downloading ${selectedReports.length} report(s)...`);
    
    try {
      const selectedReportsData = reports.filter(r => selectedReports.includes(r.id));
      
      for (const report of selectedReportsData) {
        if (report.file) {
          const apiBase = import.meta.env.VITE_API_BASE_URL || window.location.origin + '/api/';
          const host = apiBase.endsWith('/api/') ? apiBase.slice(0, -5) : apiBase;
          const url = `${host}${report.file.startsWith('/') ? '' : '/'}${report.file}`;
          window.open(url, '_blank');
        }
      }
      
      toast.dismiss(loadingToast);
      toast.success(`${selectedReports.length} report(s) downloaded`);
      clearSelection();
    } catch (error) {
      console.error('Error downloading reports:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to download some reports');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <AdminLayout>
      <div className="space-y-6 p-6 bg-linear-to-b from-slate-50 to-white min-h-screen">
        {/* Header - Elegant and Clean */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports</h1>
            <p className="text-sm text-slate-500 mt-0.5">Generate, manage, and download system reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="gap-2 border-slate-200 hover:border-slate-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Report Templates - Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((tpl) => (
            <Card key={tpl.id} className="p-4 hover:shadow-md transition-all duration-200 border-slate-200/60 hover:border-slate-300 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", tpl.color)}>
                    <tpl.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{tpl.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{tpl.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                <span className="text-[9px] font-medium uppercase text-slate-400 mr-auto">Export</span>
                {['csv', 'excel', 'pdf'].map((fmt) => (
                  <Button
                    key={fmt}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGenerateReport(tpl.id, fmt, tpl.filename)}
                    disabled={generating}
                    className="h-7 text-[10px] font-medium px-2.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Area - Seamless Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Custom Report Builder - Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-5 border-slate-200/60 shadow-sm sticky top-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Custom Report
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-slate-600">Format</Label>
                  <Select 
                    value={customReport.format} 
                    onValueChange={(v) => setCustomReport(prev => ({ ...prev, format: v }))}
                  >
                    <SelectTrigger className="h-9 text-sm mt-1 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-600">From</Label>
                    <Input 
                      type="date" 
                      value={customReport.date_range_start} 
                      onChange={(e) => setCustomReport(prev => ({ ...prev, date_range_start: e.target.value }))} 
                      className="h-9 text-sm mt-1 border-slate-200" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-600">To</Label>
                    <Input 
                      type="date" 
                      value={customReport.date_range_end} 
                      onChange={(e) => setCustomReport(prev => ({ ...prev, date_range_end: e.target.value }))} 
                      className="h-9 text-sm mt-1 border-slate-200" 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Modules</Label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'include_farmers', label: 'Farmers', icon: Users },
                      { id: 'include_crops', label: 'Crops', icon: Sprout },
                      { id: 'include_livestock', label: 'Livestock', icon: Beef },
                      { id: 'include_finance', label: 'Finance', icon: Wallet },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          id={item.id}
                          checked={customReport[item.id]}
                          onChange={(e) => setCustomReport(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <label htmlFor={item.id} className="text-sm flex items-center gap-2 cursor-pointer text-slate-700">
                          <item.icon className="w-3.5 h-3.5 text-slate-400" />
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="include_details"
                    checked={customReport.include_details}
                    onChange={(e) => setCustomReport(prev => ({ ...prev, include_details: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="include_details" className="text-sm cursor-pointer text-slate-700">Include details</label>
                </div>

                <Button 
                  onClick={handleCustomReport} 
                  disabled={generating} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Download className="w-4 h-4 mr-2"/>}
                  Generate Report
                </Button>
              </div>
            </Card>
          </div>

          {/* Reports List with Integrated Filters - Right Side */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden border-slate-200/60 shadow-sm">
              {/* Integrated Header with Filters */}
              <div className="border-b border-slate-200/60 bg-slate-50/50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <h3 className="font-bold text-slate-800">Generated Reports</h3>
                      <span className="text-sm text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                        {pagination.totalItems} {pagination.totalItems !== 1 ? 'reports' : 'report'}
                      </span>
                    </div>
                    <BulkActions
                      selectedCount={selectedReports.length}
                      onSelectAll={() => toggleSelectAll(selectedReports.length !== reports.length)}
                      onClearSelection={clearSelection}
                      allSelected={selectedReports.length === reports.length && reports.length > 0}
                      onBulkDelete={handleBulkDelete}
                      onBulkDownload={handleBulkDownload}
                      loading={bulkActionLoading}
                    />
                  </div>

                  {/* Integrated Filters - Clean and Compact */}
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-600">Filters</span>
                      {hasActiveFilters && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-35">
                      <Select
                        value={filters.report_type || 'all'}
                        onValueChange={(v) => handleFilterChange('report_type', v === 'all' ? '' : v)}
                      >
                        <SelectTrigger className="h-8 text-xs border-slate-200 bg-white">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="farmer">Farmer</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="crop">Crop</SelectItem>
                          <SelectItem value="livestock">Livestock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="min-w-30">
                      <Select
                        value={filters.format || 'all'}
                        onValueChange={(v) => handleFilterChange('format', v === 'all' ? '' : v)}
                      >
                        <SelectTrigger className="h-8 text-xs border-slate-200 bg-white">
                          <SelectValue placeholder="All Formats" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Formats</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="min-w-32.5">
                      <div className="relative">
                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                          type="date"
                          value={filters.start_date || ''}
                          onChange={(e) => handleFilterChange('start_date', e.target.value)}
                          className="h-8 text-xs pl-7 border-slate-200 bg-white"
                          placeholder="From"
                        />
                      </div>
                    </div>
                    
                    <div className="min-w-32.5">
                      <div className="relative">
                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                          type="date"
                          value={filters.end_date || ''}
                          onChange={(e) => handleFilterChange('end_date', e.target.value)}
                          className="h-8 text-xs pl-7 border-slate-200 bg-white"
                          placeholder="To"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={applyFilters} 
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                    >
                      Apply
                    </Button>
                    
                    {hasActiveFilters && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={clearFilters}
                        className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Report Table */}
              <ReportHistoryTable
                reports={reports}
                loading={loading}
                selectedReports={selectedReports}
                onToggleSelect={toggleSelectOne}
                onSelectAll={(checked) => toggleSelectAll(checked)}
                onDownload={handleDownload}
                onDelete={(report) => {
                  setReportToDelete(report);
                  setShowDeleteDialog(true);
                }}
              />
              
              {/* Pagination */}
              <ReportPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
              />
            </Card>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{reportToDelete?.title || reportToDelete?.report_type}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteReport} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Reports;