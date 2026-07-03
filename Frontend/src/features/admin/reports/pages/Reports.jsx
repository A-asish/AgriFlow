// src/features/admin/reports/pages/Reports.jsx
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { FileText, Download, Users, Wallet, Sprout, Beef, MoreVertical, Clock, Loader2, Trash2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
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
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import { formatDate } from '../../utils/helpers';
import { toast } from 'sonner';

const Reports = () => {
  const { data: reportsData, loading, refresh } = useAdminData({
    fetchFn: () => adminService.listReports()
  });
  
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
  
  const [generating, setGenerating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const reportTemplates = [
    { id: 'farmer', title: 'Farmer Demographic Registry', description: 'Complete list of registered farmers with contact and farm specifications.', icon: Users, color: 'text-blue-500 bg-blue-50', filename: 'farmers_report' },
    { id: 'financial', title: 'Ecosystem Financial Summary', description: 'System-wide income and expense records with categorical breakdown.', icon: Wallet, color: 'text-emerald-500 bg-emerald-50', filename: 'financial_report' },
    { id: 'crop', title: 'Platform Cultivation Metrics', description: 'Monitoring of current growth stages and expected yield across all fields.', icon: Sprout, color: 'text-amber-500 bg-amber-50', filename: 'crops_report' },
    { id: 'livestock', title: 'Livestock Health & Stats', description: 'Animal inventory monitoring, health states, and breeding cycles.', icon: Beef, color: 'text-purple-500 bg-purple-50', filename: 'livestock_report' },
  ];

  const getFileExtension = (format) => {
    switch (format) {
      case 'excel': return 'xlsx';
      case 'pdf': return 'pdf';
      default: return 'csv';
    }
  };

  const handleGenerateReport = async (reportType, format, filename) => {
    setGenerating(true);
    const loadingToast = toast.loading(`Generating ${reportType} report...`);
    
    try {
      const response = await adminService.generateReport({
        report_type: reportType,
        format: format,
        date_range_start: customReport.date_range_start,
        date_range_end: customReport.date_range_end,
        include_details: customReport.include_details,
      });
      
      // Debug logs
      console.log('========== REPORT GENERATION DEBUG ==========');
      console.log('Full response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Is response.data a Blob?', response.data instanceof Blob);
      console.log('Response headers:', response.headers);
      console.log('Response status:', response.status);
      console.log('=============================================');
      
      toast.dismiss(loadingToast);
      
      // Check if response is a blob (file)
      if (response.data instanceof Blob) {
        // Check if it's an error response (sometimes errors come as JSON in blob)
        if (response.data.type === 'application/json') {
          // Try to read as JSON to check for error
          const text = await response.data.text();
          try {
            const errorData = JSON.parse(text);
            if (errorData.error) {
              toast.error(errorData.error);
              return;
            }
          } catch (e) {
            // Not JSON, proceed with download
          }
        }
        
        // Get file extension
        const fileExt = getFileExtension(format);
        const downloadFilename = `${filename}_${customReport.date_range_start}_to_${customReport.date_range_end}.${fileExt}`;
        
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded!`);
        refresh();
      } else if (response.data && typeof response.data === 'object' && response.data.error) {
        // Handle JSON error response
        toast.error(response.data.error);
      } else {
        console.error('Unexpected response format:', response.data);
        toast.error('Unexpected response format');
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
      console.error('Error response:', error.response);
      toast.dismiss(loadingToast);
      
      // Check if error response has a blob
      if (error.response && error.response.data instanceof Blob) {
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
      refresh();
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
      window.open(report.file, '_blank');
    } else {
      toast.info('No file available for this report');
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      await adminService.deleteReport(reportToDelete.id);
      toast.success('Report deleted successfully');
      refresh();
      setShowDeleteDialog(false);
      setReportToDelete(null);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const columns = [
    {
      header: 'Report Name',
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-slate-500"/>
          </div>
          <div>
            <p className="font-bold text-slate-700 text-sm">{r.title || r.report_type}</p>
            <p className="text-[10px] text-slate-400">{r.report_type}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: (r) => <span className="text-xs text-slate-500">{formatDate(r.generated_at)}</span>,
    },
    {
      header: 'Format',
      accessor: (r) => <span className="text-xs font-bold text-slate-400 uppercase">{r.format}</span>,
    },
    {
      header: 'By',
      accessor: (r) => <span className="text-xs text-slate-500">{r.generated_by_name || 'System'}</span>,
    },
    {
      header: 'Downloads',
      accessor: (r) => <span className="text-xs font-bold text-slate-500">{r.download_count || 0}</span>,
    },
    {
      header: '',
      className: 'text-right',
      accessor: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4 text-slate-400"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleDownload(r)} className="gap-2">
              <Download className="w-4 h-4"/> Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setReportToDelete(r); setShowDeleteDialog(true); }} className="gap-2 text-red-600">
              <Trash2 className="w-4 h-4"/> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-xs text-slate-500">Generate and download system reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Report Builder */}
          <Card className="p-5">
            <h3 className="text-base font-bold mb-4">Custom Report</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Format</Label>
                <Select value={customReport.format} onValueChange={(v) => setCustomReport(prev => ({ ...prev, format: v }))}>
                  <SelectTrigger className="h-9 text-sm mt-1">
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
                  <Label className="text-xs">Start Date</Label>
                  <Input 
                    type="date" 
                    value={customReport.date_range_start} 
                    onChange={(e) => setCustomReport(prev => ({ ...prev, date_range_start: e.target.value }))} 
                    className="h-9 text-sm mt-1" 
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input 
                    type="date" 
                    value={customReport.date_range_end} 
                    onChange={(e) => setCustomReport(prev => ({ ...prev, date_range_end: e.target.value }))} 
                    className="h-9 text-sm mt-1" 
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Modules</Label>
                <div className="space-y-2">
                  {[
                    { id: 'include_farmers', label: 'Farmers', icon: Users },
                    { id: 'include_crops', label: 'Crops', icon: Sprout },
                    { id: 'include_livestock', label: 'Livestock', icon: Beef },
                    { id: 'include_finance', label: 'Finance', icon: Wallet },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50">
                      <Checkbox 
                        id={item.id} 
                        checked={customReport[item.id]} 
                        onCheckedChange={(checked) => setCustomReport(prev => ({ ...prev, [item.id]: checked }))} 
                      />
                      <label htmlFor={item.id} className="text-sm flex items-center gap-2 cursor-pointer">
                        <item.icon className="w-4 h-4 text-slate-400" />
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox 
                  id="include_details" 
                  checked={customReport.include_details} 
                  onCheckedChange={(checked) => setCustomReport(prev => ({ ...prev, include_details: checked }))} 
                />
                <label htmlFor="include_details" className="text-sm cursor-pointer">Include details</label>
              </div>

              <Button 
                onClick={handleCustomReport} 
                disabled={generating} 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Download className="w-4 h-4 mr-2"/>}
                Generate Report
              </Button>
            </div>
          </Card>

          {/* Templates & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates.map((tpl) => (
                <Card key={tpl.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className={cn("p-2 rounded-lg", tpl.color)}>
                      <tpl.icon className="w-5 h-5"/>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleGenerateReport(tpl.id, customReport.format, tpl.filename)} 
                      disabled={generating} 
                      className="text-emerald-600"
                    >
                      {generating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Download className="w-3 h-3 mr-1"/>}
                      Generate
                    </Button>
                  </div>
                  <h4 className="font-bold mt-3">{tpl.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>
                </Card>
              ))}
            </div>

            {/* Report History */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold">Generated Reports</h3>
              </div>
              <DataTable 
                columns={columns} 
                data={reportsData?.reports || []} 
                loading={loading} 
                emptyMessage="No reports generated yet" 
              />
            </Card>
          </div>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteReport} className="bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Reports;