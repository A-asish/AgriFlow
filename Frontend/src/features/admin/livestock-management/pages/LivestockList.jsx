// src/features/admin/livestock-management/pages/LivestockList.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { 
  Plus, RefreshCw, PawPrint, Activity, Baby, X, Users, 
  MoreVertical, Eye, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.api';
import LivestockFilters from '../components/LivestockFilters';
import BulkActionBar from '../components/BulkActionBar';
import Pagination from '../components/Pagination';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import AnimalDetailModal from '../components/AnimalDetailModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

// Simple Stats Card without money
const StatsCard = ({ title, value, icon: Icon, bgColor, textColor, subtitle }) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </div>
    </Card>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === 'active') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
  }
  if (s === 'sold') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Sold</span>;
  }
  if (s === 'dead') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Deceased</span>;
  }
  if (s === 'butchered') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Butchered</span>;
  }
  return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status || 'Unknown'}</span>;
};

// Gender Badge Component
const GenderBadge = ({ gender }) => {
  const g = gender?.toLowerCase();
  if (g === 'male') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">Male</span>;
  }
  if (g === 'female') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-600">Female</span>;
  }
  return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Unknown</span>;
};

// Livestock Table Component
const LivestockTable = ({ 
  livestock, 
  loading, 
  selectedLivestock, 
  onSelectAll, 
  onSelect, 
  onViewDetails, 
  onDelete,
  selectAll 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </Card>
    );
  }

  if (livestock.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No livestock found. Register an animal to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectAll && livestock.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Animal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Farmer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Age</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {livestock.map((animal) => (
              <tr key={animal.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLivestock.includes(animal.id)}
                    onChange={() => onSelect(animal.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{animal.name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">Tag: {animal.tag_number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{animal.animal_type_name}</p>
                  <GenderBadge gender={animal.gender} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-700">{animal.farmer_name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-700">
                    {animal.age_months ? `${animal.age_months} months` : 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <StatusBadge status={animal.status} />
                    {animal.is_pregnant && (
                      <span className="inline-flex items-center gap-1 text-xs text-pink-600">
                        <Baby className="w-3 h-3" />
                        Pregnant
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-500 text-sm">{formatDate(animal.created_at)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-slate-100 p-2">
                      <DropdownMenuItem 
                        onClick={() => onViewDetails(animal)}
                        className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5"
                      >
                        <Eye className="w-4 h-4 text-blue-500" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(animal)}
                        className="rounded-xl gap-3 font-bold text-red-600 cursor-pointer p-2.5"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Animal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const LivestockList = () => {
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  
  // Selection states
  const [selectedLivestock, setSelectedLivestock] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActionBar, setShowBulkActionBar] = useState(false);
  
  // Modal states
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Coming Soon Card state
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Animal types for filter
  const [typeOptions, setTypeOptions] = useState([{ label: 'All Types', value: 'all' }]);

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Sold', value: 'sold' },
    { label: 'Deceased', value: 'dead' },
    { label: 'Butchered', value: 'butchered' },
  ];

  const genderOptions = [
    { label: 'All Genders', value: 'all' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Unknown', value: 'unknown' },
  ];

  // Fetch animal types
  useEffect(() => {
    const fetchAnimalTypes = async () => {
      try {
        const response = await adminService.listAnimalTypes();
        if (response.data) {
          const options = [
            { label: 'All Types', value: 'all' },
            ...response.data.map(type => ({ label: type.name, value: type.name }))
          ];
          setTypeOptions(options);
        }
      } catch (error) {
        console.error('Error fetching animal types:', error);
      }
    };
    fetchAnimalTypes();
  }, []);

  // Fetch livestock
  const fetchLivestock = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (typeFilter && typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (genderFilter && genderFilter !== 'all') params.gender = genderFilter;
      
      const response = await adminService.listLivestock(params);
      
      if (response.data && response.data.livestock) {
        setLivestock(response.data.livestock);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 1
        });
      } else {
        setLivestock([]);
      }
    } catch (error) {
      console.error('Error fetching livestock:', error);
      toast.error(error.response?.data?.error || 'Failed to load livestock');
      setLivestock([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivestock();
  }, [pagination.page, pagination.page_size, searchTerm, typeFilter, statusFilter, genderFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setGenderFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    fetchLivestock();
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLivestock([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } else {
      const allIds = livestock.map(a => a.id);
      setSelectedLivestock(allIds);
      setSelectAll(true);
      setShowBulkActionBar(true);
    }
  };

  const handleSelect = (id) => {
    let newSelected;
    if (selectedLivestock.includes(id)) {
      newSelected = selectedLivestock.filter(i => i !== id);
    } else {
      newSelected = [...selectedLivestock, id];
    }
    setSelectedLivestock(newSelected);
    setShowBulkActionBar(newSelected.length > 0);
    setSelectAll(newSelected.length === livestock.length);
  };

  const handleBulkDelete = async () => {
    if (selectedLivestock.length === 0) {
      toast.error('No livestock selected');
      return;
    }
    
    setActionLoading(true);
    try {
      const promises = selectedLivestock.map(id => adminService.deleteLivestock(id));
      await Promise.all(promises);
      
      toast.success(`${selectedLivestock.length} animals deleted successfully`);
      fetchLivestock();
      setSelectedLivestock([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete animals');
    } finally {
      setActionLoading(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnimal) return;
    
    setActionLoading(true);
    try {
      await adminService.deleteLivestock(selectedAnimal.id);
      toast.success(`${selectedAnimal.name || selectedAnimal.tag_number} deleted successfully`);
      fetchLivestock();
      setShowDeleteDialog(false);
      setSelectedAnimal(null);
    } catch (error) {
      console.error('Error deleting animal:', error);
      toast.error('Failed to delete animal');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate stats (only counts, no money)
  const totalAnimals = livestock.length;
  const activeAnimals = livestock.filter(a => a.status === 'active').length;
  const pregnantAnimals = livestock.filter(a => a.is_pregnant).length;
  const femaleAnimals = livestock.filter(a => a.gender === 'female').length;
  const maleAnimals = livestock.filter(a => a.gender === 'male').length;

  const stats = [
    {
      title: 'Total Animals',
      value: totalAnimals,
      icon: PawPrint,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      subtitle: 'All livestock'
    },
    {
      title: 'Active',
      value: activeAnimals,
      icon: Activity,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      subtitle: 'Currently active'
    },
    {
      title: 'Pregnant',
      value: pregnantAnimals,
      icon: Baby,
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
      subtitle: 'Expecting offspring'
    },
    {
      title: 'Female',
      value: femaleAnimals,
      icon: Users,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      subtitle: 'Breeding potential'
    },
    {
      title: 'Male',
      value: maleAnimals,
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      subtitle: 'Breeding/Meat'
    }
  ];

  const hasActiveFilters = searchTerm || typeFilter || statusFilter || genderFilter;

  // Filters Component
  const LivestockFiltersComponent = () => (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, tag number, or farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm">
            Search
          </button>
          {hasActiveFilters && (
            <button onClick={handleResetFilters} className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm">
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={typeFilter || 'all'}
            onChange={(e) => setTypeFilter(e.target.value === 'all' ? '' : e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={statusFilter || 'all'}
            onChange={(e) => setStatusFilter(e.target.value === 'all' ? '' : e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={genderFilter || 'all'}
            onChange={(e) => setGenderFilter(e.target.value === 'all' ? '' : e.target.value)}
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

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Livestock Management</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Monitor and manage all animals across the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowComingSoon(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4"/> Register Animal
            </button>
          </div>
        </div>

        {/* Coming Soon Card */}
        {showComingSoon && (
          <Card className="relative p-6 bg-linear-to-r from-amber-50 to-orange-50 border-amber-200">
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <PawPrint className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-800">Coming Soon!</h3>
                <p className="text-amber-700 mt-1">
                  The animal registration feature is currently under development. 
                  We're working hard to bring you a seamless experience for adding and managing livestock.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    In Development
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Filters */}
        <LivestockFiltersComponent />

        {/* Bulk Action Bar */}
        {showBulkActionBar && selectedLivestock.length > 0 && (
          <BulkActionBar
            selectedCount={selectedLivestock.length}
            onDelete={() => setShowBulkDeleteDialog(true)}
            onClear={() => {
              setSelectedLivestock([]);
              setSelectAll(false);
              setShowBulkActionBar(false);
            }}
          />
        )}

        {/* Table */}
        <LivestockTable
          livestock={livestock}
          loading={loading}
          selectedLivestock={selectedLivestock}
          onSelectAll={handleSelectAll}
          onSelect={handleSelect}
          onViewDetails={(animal) => {
            setSelectedAnimal(animal);
            setShowDetailModal(true);
          }}
          onDelete={(animal) => {
            setSelectedAnimal(animal);
            setShowDeleteDialog(true);
          }}
          selectAll={selectAll}
        />

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            loading={loading}
          />
        )}

        {/* Animal Detail Modal */}
        {selectedAnimal && (
          <AnimalDetailModal
            open={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedAnimal(null);
            }}
            animalId={selectedAnimal.id}
            onUpdate={fetchLivestock}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedAnimal(null);
          }}
          onConfirm={handleDelete}
          animal={selectedAnimal}
          loading={actionLoading}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={showBulkDeleteDialog}
          onClose={() => setShowBulkDeleteDialog(false)}
          onConfirm={handleBulkDelete}
          loading={actionLoading}
          isBulk={true}
          count={selectedLivestock.length}
        />
      </div>
    </AdminLayout>
  );
};

export default LivestockList;