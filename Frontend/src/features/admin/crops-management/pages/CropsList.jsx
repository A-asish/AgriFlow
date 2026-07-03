// src/features/admin/crops-management/pages/CropsList.jsx
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { 
  Sprout, 
  MoreVertical, 
  Calendar, 
  User, 
  Plus, 
  MapPin, 
  Eye, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Package,
  Loader2,
  RefreshCw,
  CheckCircle,
  Search
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import adminService from '../../services/admin.api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import CropDetailModal from '../components/CropDetailModal';
import CropRegisterModal from '../components/CropRegisterModal';
import BulkActionBar from '../components/BulkActionBar';
import BulkConfirmDialog from '../components/BulkConfirmDialog';
import { toast } from 'sonner';

// Nepali Districts
const NEPAL_DISTRICTS = [
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke",
  "Bara", "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh",
  "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusha", "Dolakha", "Dolpa",
  "Doti", "Eastern Rukum", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot",
  "Jhapa", "Jumla", "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski",
  "Kathmandu", "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari",
  "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalpur",
  "Nuwakot", "Okhaldhunga", "Palpa", "Panchthar", "Parasi", "Parbat", "Parsa",
  "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rupandehi", "Salyan",
  "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha",
  "Solukhumbu", "Sunsari", "Surkhet", "Syangja", "Tanahun", "Taplejung",
  "Terhathum", "Udayapur", "Western Rukum"
];

// Helper function for date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

const CropsList = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  
  // Selection states
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActionBar, setShowBulkActionBar] = useState(false);
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  
  // Modal states
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cropToDelete, setCropToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch crops
  const fetchCrops = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (stageFilter) params.growth_stage = stageFilter;
      if (districtFilter) params.district = districtFilter;
      
      console.log('Fetching crops with params:', params);
      const response = await adminService.listCrops(params);
      console.log('Response:', response.data);
      
      setCrops(response.data.crops || []);
      setPagination(response.data.pagination || {
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 1
      });
      setSelectedCrops([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } catch (error) {
      console.error('Error fetching crops:', error);
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [pagination.page, pagination.page_size, searchTerm, statusFilter, stageFilter, districtFilter]);

  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle filter changes
  const handleStatusChange = (value) => {
    setStatusFilter(value === 'all' ? '' : value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStageChange = (value) => {
    setStageFilter(value === 'all' ? '' : value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDistrictChange = (value) => {
    setDistrictFilter(value === 'all' ? '' : value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStageFilter('');
    setDistrictFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    fetchCrops();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCrops([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } else {
      const allCropIds = crops.map(c => c.id);
      setSelectedCrops(allCropIds);
      setSelectAll(true);
      setShowBulkActionBar(true);
    }
  };

  // Handle select single crop
  const handleSelectCrop = (cropId) => {
    let newSelected;
    if (selectedCrops.includes(cropId)) {
      newSelected = selectedCrops.filter(id => id !== cropId);
    } else {
      newSelected = [...selectedCrops, cropId];
    }
    setSelectedCrops(newSelected);
    setShowBulkActionBar(newSelected.length > 0);
    setSelectAll(newSelected.length === crops.length);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCrops.length === 0) {
      toast.error('No crops selected');
      return;
    }
    
    setActionLoading(true);
    try {
      const promises = selectedCrops.map(cropId => adminService.deleteCrop(cropId));
      await Promise.all(promises);
      
      toast.success(`${selectedCrops.length} crops deleted successfully`);
      fetchCrops();
      setSelectedCrops([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete crops');
    } finally {
      setActionLoading(false);
      setShowBulkConfirmDialog(false);
    }
  };

  // Handle single delete
  const handleDeleteCrop = async () => {
    if (!cropToDelete) return;
    
    setActionLoading(true);
    try {
      await adminService.deleteCrop(cropToDelete.id);
      toast.success(`${cropToDelete.name} deleted successfully`);
      fetchCrops();
      setShowDeleteDialog(false);
      setCropToDelete(null);
    } catch (error) {
      console.error('Error deleting crop:', error);
      toast.error('Failed to delete crop');
    } finally {
      setActionLoading(false);
    }
  };

  // Get icon background color based on stage
  const getIconBackground = (stage) => {
    const s = stage?.toLowerCase();
    switch (s) {
      case 'harvest':
        return 'bg-white border-2 border-emerald-500 text-emerald-600';
      case 'maturation':
        return 'bg-white border-2 border-amber-500 text-amber-600';
      case 'flowering':
        return 'bg-white border-2 border-pink-500 text-pink-600';
      case 'vegetative':
        return 'bg-white border-2 border-blue-500 text-blue-600';
      case 'germination':
        return 'bg-white border-2 border-purple-500 text-purple-600';
      default:
        return 'bg-white border-2 border-emerald-400 text-emerald-500';
    }
  };

  const getStageColor = (stage) => {
    const s = stage?.toLowerCase();
    switch (s) {
      case 'harvest': return 'bg-emerald-500';
      case 'maturation': return 'bg-amber-500';
      case 'flowering': return 'bg-pink-500';
      case 'vegetative': return 'bg-blue-500';
      case 'germination': return 'bg-purple-500';
      default: return 'bg-slate-200';
    }
  };

  const getStageDisplayName = (stage) => {
    const s = stage?.toLowerCase();
    const stages = {
      'germination': 'Germination',
      'vegetative': 'Vegetative',
      'flowering': 'Flowering',
      'maturation': 'Maturation',
      'harvest': 'Harvest'
    };
    return stages[s] || s || 'Unknown';
  };

  const getStageProgress = (currentStage) => {
    const stages = ['germination', 'vegetative', 'flowering', 'maturation', 'harvest'];
    const index = stages.indexOf(currentStage?.toLowerCase());
    if (index === -1) return 0;
    return ((index + 1) / stages.length) * 100;
  };

  // Calculate stats
  const totalCrops = crops.length;
  const activeCrops = crops.filter(c => c.status === 'active').length;
  const harvestedCrops = crops.filter(c => c.status === 'harvested').length;
  const completedCrops = crops.filter(c => c.status === 'done').length;
  const totalProfit = crops.reduce((sum, c) => sum + (c.net_profit || 0), 0);

  const stats = [
    {
      title: 'Total Crops',
      value: totalCrops,
      icon: Sprout,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Active',
      value: activeCrops,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Harvested',
      value: harvestedCrops,
      icon: Package,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Completed',
      value: completedCrops,
      icon: CheckCircle,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Profit',
      value: `Rs. ${totalProfit.toLocaleString('en-IN')}`,
      icon: DollarSign,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
    }
  ];

  // Options for selects
  const districtOptions = [
    { label: 'All Districts', value: 'all' },
    ...NEPAL_DISTRICTS.map(district => ({
      label: district,
      value: district.toLowerCase()
    }))
  ];

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Harvested', value: 'harvested' },
    { label: 'Done', value: 'done' },
  ];

  const stageOptions = [
    { label: 'All Stages', value: 'all' },
    { label: 'Germination', value: 'germination' },
    { label: 'Vegetative', value: 'vegetative' },
    { label: 'Flowering', value: 'flowering' },
    { label: 'Maturation', value: 'maturation' },
    { label: 'Harvest', value: 'harvest' },
  ];

  const columns = [
    {
      header: () => (
        <input
          type="checkbox"
          checked={selectAll && crops.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300"
          disabled={crops.length === 0 || actionLoading}
        />
      ),
      accessor: (c) => (
        <input
          type="checkbox"
          checked={selectedCrops.includes(c.id)}
          onChange={() => handleSelectCrop(c.id)}
          className="rounded border-gray-300"
          disabled={actionLoading}
        />
      ),
    },
    {
      header: 'Crop Details',
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md", getIconBackground(c.growth_stage))}>
            <Sprout className="w-5 h-5"/>
          </div>
          <div>
            <p className="font-bold text-slate-800">{c.name}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.variety || 'Standard'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Farmer',
      accessor: (c) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400"/>
            <span className="text-sm font-bold text-slate-600">{c.farmer_name}</span>
          </div>
          <p className="text-xs text-slate-400 ml-5">{c.farmer_email}</p>
        </div>
      ),
    },
    {
      header: 'District',
      accessor: (c) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400"/>
          <span>{c.district || c.farmer_district || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Field Info',
      accessor: (c) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <MapPin className="w-3 h-3"/> {c.field_name || 'N/A'}
          </div>
          <p className="text-xs font-semibold text-slate-400">{c.field_area} {c.area_unit}</p>
        </div>
      ),
    },
    {
      header: 'Growth Phase',
      accessor: (c) => (
        <div className="space-y-1.5 min-w-32">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight text-slate-400">
            <span>{getStageDisplayName(c.growth_stage)}</span>
            <span>{Math.round(getStageProgress(c.growth_stage))}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500", getStageColor(c.growth_stage))} 
              style={{ width: `${getStageProgress(c.growth_stage)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (c) => <StatusBadge status={c.status}/>,
    },
    {
      header: 'Dates',
      accessor: (c) => (
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Planted: {formatDate(c.planting_date)}
          </p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
            Harvest: {formatDate(c.expected_harvest_date) || 'Not set'}
          </p>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      accessor: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="w-4 h-4 text-slate-400"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-slate-100 p-2">
            <DropdownMenuItem 
              onClick={() => {
                setSelectedCrop(c);
                setShowDetailModal(true);
              }}
              className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5"
            >
              <Eye className="w-4 h-4 text-blue-500"/> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                setCropToDelete(c);
                setShowDeleteDialog(true);
              }}
              className="rounded-xl gap-3 font-bold text-red-600 cursor-pointer p-2.5"
            >
              <Trash2 className="w-4 h-4"/> Delete Crop
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Crop Management</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Monitor and manage all cultivation cycles across the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowRegisterModal(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
            >
              <Plus className="w-4 h-4"/> Register Crop
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search crops or farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="bg-emerald-600 hover:bg-emerald-700 h-9 px-3 text-sm"
              >
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
              {(searchTerm || statusFilter || stageFilter || districtFilter) && (
                <Button 
                  variant="ghost" 
                  onClick={handleResetFilters} 
                  className="gap-1 h-9 px-3 text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-37.5 h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stageFilter || 'all'} onValueChange={handleStageChange}>
                <SelectTrigger className="w-37.5 h-9 text-sm">
                  <SelectValue placeholder="Growth Stage" />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={districtFilter || 'all'} onValueChange={handleDistrictChange}>
                <SelectTrigger className="w-45 h-9 text-sm">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  {districtOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Bulk Action Bar */}
        {showBulkActionBar && selectedCrops.length > 0 && (
          <BulkActionBar
            selectedCount={selectedCrops.length}
            onDelete={() => setShowBulkConfirmDialog(true)}
            onClear={() => {
              setSelectedCrops([]);
              setSelectAll(false);
              setShowBulkActionBar(false);
            }}
            actionLoading={actionLoading}
          />
        )}

        {/* Data Table */}
        <DataTable 
          columns={columns} 
          data={crops} 
          loading={loading} 
          emptyMessage="No crops found. Register a new crop to get started."
        />

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t flex-wrap gap-3">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
              {Math.min(pagination.page * pagination.page_size, pagination.total)} of {pagination.total} crops
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
        )}

        {/* Modals */}
        {selectedCrop && (
          <CropDetailModal
            open={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedCrop(null);
            }}
            cropId={selectedCrop.id}
            onUpdate={fetchCrops}
          />
        )}

        <CropRegisterModal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => {
            fetchCrops();
            toast.success('Crop registered successfully');
          }}
        />

        {/* Delete Dialogs */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the crop
                "{cropToDelete?.name}" and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteCrop} 
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete Crop
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <BulkConfirmDialog
          open={showBulkConfirmDialog}
          onClose={() => setShowBulkConfirmDialog(false)}
          onConfirm={handleBulkDelete}
          actionType="delete"
          selectedCount={selectedCrops.length}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default CropsList;