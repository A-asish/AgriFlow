// src/features/admin/users-management/pages/UserList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MoreVertical, 
  Download, 
  Search,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  Crown,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
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
import UserDetailModal from '../components/UserDetailModal';
import BulkActionBar from '../components/BulkActionBar';

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

// Role Badge Component
const RoleBadge = ({ user }) => {
  if (user.is_admin === true) {
    return (
      <Badge className="flex items-center gap-1.5 bg-purple-100 text-purple-700 border-purple-200">
        <Crown className="w-3 h-3" />
        <span>Admin</span>
      </Badge>
    );
  }
  if (user.is_farmer === true) {
    return (
      <Badge className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 border-emerald-200">
        <Building2 className="w-3 h-3" />
        <span>Farmer</span>
      </Badge>
    );
  }
  return null;
};

// Status Badge Component
const UserStatusBadge = ({ user }) => {
  if (user.is_active === false) {
    return (
      <Badge className="flex items-center gap-1.5 bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3" />
        <span>Inactive</span>
      </Badge>
    );
  }
  
  if (user.is_email_verified === false && user.is_active === true) {
    return (
      <Badge className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3" />
        <span>Pending</span>
      </Badge>
    );
  }
  
  return (
    <Badge className="flex items-center gap-1.5 bg-green-100 text-green-700 border-green-200">
      <CheckCircle className="w-3 h-3" />
      <span>Active</span>
    </Badge>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  
  // Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showBulkActionBar, setShowBulkActionBar] = useState(false);
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  
  // Loading states
  const [exporting, setExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (districtFilter && districtFilter !== 'all') params.district = districtFilter;
      if (pagination.page) params.page = pagination.page;
      if (pagination.page_size) params.page_size = pagination.page_size;
      
      const [farmersRes, adminsRes] = await Promise.all([
        adminService.listFarmers(params),
        adminService.listAdmins()
      ]);
      
      let allUsers = [];
      
      // Add farmers
      if (farmersRes.data?.farmers) {
        const farmersWithFlags = farmersRes.data.farmers.map(farmer => ({
          ...farmer,
          is_farmer: true,
          is_admin: false
        }));
        allUsers = [...allUsers, ...farmersWithFlags];
      }
      
      // Add admins
      if (adminsRes.data?.admins) {
        const adminsWithFlags = adminsRes.data.admins.map(admin => ({
          ...admin,
          is_admin: true,
          is_farmer: false
        }));
        allUsers = [...allUsers, ...adminsWithFlags];
      }
      
      // Apply role filter
      if (roleFilter !== 'all') {
        allUsers = allUsers.filter(user => {
          if (roleFilter === 'admin') return user.is_admin === true;
          if (roleFilter === 'farmer') return user.is_farmer === true;
          return true;
        });
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        allUsers = allUsers.filter(user => {
          if (statusFilter === 'active') return user.is_active === true && user.is_email_verified === true;
          if (statusFilter === 'pending') return user.is_active === true && user.is_email_verified === false;
          if (statusFilter === 'inactive') return user.is_active === false;
          return true;
        });
      }
      
      // Apply district filter
      if (districtFilter !== 'all') {
        allUsers = allUsers.filter(user => {
          const userDistrict = (user.district || user.farm_district || user.location || '').toLowerCase();
          return userDistrict.includes(districtFilter.toLowerCase());
        });
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        allUsers = allUsers.filter(user => 
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.full_name?.toLowerCase().includes(searchLower) ||
          (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
          (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
          user.phone?.includes(searchTerm)
        );
      }
      
      setUsers(allUsers);
      setPagination({
        total: allUsers.length,
        page: pagination.page,
        page_size: pagination.page_size,
        total_pages: Math.ceil(allUsers.length / pagination.page_size)
      });
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.error || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.page_size, searchTerm, roleFilter, statusFilter, districtFilter]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDistrictFilterChange = (value) => {
    setDistrictFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setDistrictFilter('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } else {
      const currentPageIds = users
        .slice((pagination.page - 1) * pagination.page_size, pagination.page * pagination.page_size)
        .filter(u => u.is_farmer === true)
        .map(u => u.id);
      setSelectedUsers(currentPageIds);
      setSelectAll(true);
      setShowBulkActionBar(currentPageIds.length > 0);
    }
  };

  const handleSelectUser = (userId) => {
    let newSelected;
    if (selectedUsers.includes(userId)) {
      newSelected = selectedUsers.filter(id => id !== userId);
    } else {
      newSelected = [...selectedUsers, userId];
    }
    setSelectedUsers(newSelected);
    setShowBulkActionBar(newSelected.length > 0);
    setSelectAll(newSelected.length === users
      .slice((pagination.page - 1) * pagination.page_size, pagination.page * pagination.page_size)
      .filter(u => u.is_farmer === true).length);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('No farmers selected');
      return;
    }
    
    setActionLoading(true);
    try {
      await adminService.bulkActionFarmers({
        farmer_ids: selectedUsers,
        action: action
      });
      
      toast.success(`Successfully ${action}d ${selectedUsers.length} farmers`);
      fetchUsers();
      setSelectedUsers([]);
      setSelectAll(false);
      setShowBulkActionBar(false);
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error(`Failed to ${action} farmers`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setActionLoading(true);
    try {
      await adminService.deleteFarmer(userToDelete.id);
      toast.success(`User ${userToDelete.full_name || userToDelete.username} deleted successfully`);
      fetchUsers();
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!userToChangeRole) return;
    
    setActionLoading(true);
    try {
      if (userToChangeRole.is_farmer === true) {
        await adminService.promoteFarmer(userToChangeRole.id);
        toast.success(`${userToChangeRole.full_name || userToChangeRole.username} promoted to Admin`);
      }
      fetchUsers();
      setShowRoleChangeDialog(false);
      setUserToChangeRole(null);
    } catch (error) {
      console.error('Role change error:', error);
      toast.error('Failed to change user role');
    } finally {
      setActionLoading(false);
    }
  };

  // Fixed export function
  const handleExport = async (format) => {
    setExporting(true);
    try {
      // Create custom export data with user district
      const exportData = users.map(user => ({
        'ID': user.id,
        'Username': user.username,
        'Full Name': user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        'Email': user.email,
        'Phone': user.phone || '-',
        'Role': user.is_admin ? 'Admin' : 'Farmer',
        'District': user.district || user.farm_district || user.location || 'N/A',
        'Status': user.is_active && user.is_email_verified ? 'Active' : 
                  (!user.is_email_verified && user.is_active) ? 'Pending' : 'Inactive',
        'Email Verified': user.is_email_verified ? 'Yes' : 'No',
        'Joined Date': user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'
      }));
      
      if (format === 'csv') {
        const headers = Object.keys(exportData[0] || {});
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        for (const row of exportData) {
          const values = headers.map(header => {
            let value = row[header] || '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvRows.push(values.join(','));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success(`Users exported successfully as CSV`);
      } else if (format === 'excel') {
        const headers = Object.keys(exportData[0] || {});
        const csvRows = [];
        csvRows.push(headers.join('\t'));
        
        for (const row of exportData) {
          const values = headers.map(header => row[header] || '');
          csvRows.push(values.join('\t'));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.xls`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success(`Users exported successfully as Excel`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  // Generate district options
  const districtOptions = [
    { label: 'All Districts', value: 'all' },
    ...NEPAL_DISTRICTS.map(district => ({
      label: district,
      value: district.toLowerCase()
    }))
  ];

  const startIndex = (pagination.page - 1) * pagination.page_size;
  const currentPageUsers = users.slice(startIndex, startIndex + pagination.page_size);

  const adminCount = users.filter(u => u.is_admin === true).length;
  const farmerCount = users.filter(u => u.is_farmer === true).length;
  const activeCount = users.filter(u => u.is_active === true && u.is_email_verified === true).length;
  const pendingCount = users.filter(u => u.is_active === true && u.is_email_verified === false).length;
  const inactiveCount = users.filter(u => u.is_active === false).length;

  const stats = [
    { title: 'Total Users', value: users.length, icon: Users, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { title: 'Admins', value: adminCount, icon: Crown, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { title: 'Farmers', value: farmerCount, icon: Building2, bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
    { title: 'Active', value: activeCount, icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Pending', value: pendingCount, icon: Clock, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
    { title: 'Inactive', value: inactiveCount, icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-600' }
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchUsers}>Try Again</Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 mt-1">Manage farmers and administrators on the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')}
              disabled={exporting || users.length === 0}
              className="gap-2"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('excel')}
              disabled={exporting || users.length === 0}
              className="gap-2"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export Excel
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
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
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleSearch(searchTerm)} className="bg-emerald-600 hover:bg-emerald-700 h-9 px-3 text-sm">
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || districtFilter !== 'all') && (
                <Button variant="ghost" onClick={handleResetFilters} className="gap-1 h-9 px-3 text-sm">
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-35 h-9 text-sm">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-35 h-9 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={districtFilter} onValueChange={handleDistrictFilterChange}>
                <SelectTrigger className="w-45 h-9 text-sm">
                  <SelectValue placeholder="All Districts" />
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
        {showBulkActionBar && selectedUsers.length > 0 && (
          <BulkActionBar
            selectedCount={selectedUsers.length}
            onActivate={() => handleBulkAction('activate')}
            onDeactivate={() => handleBulkAction('deactivate')}
            onVerify={() => handleBulkAction('verify')}
            onDelete={() => handleBulkAction('delete')}
            onClear={() => {
              setSelectedUsers([]);
              setSelectAll(false);
              setShowBulkActionBar(false);
            }}
            actionLoading={actionLoading}
          />
        )}

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectAll && currentPageUsers.filter(u => u.is_farmer === true).length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                      disabled={currentPageUsers.filter(u => u.is_farmer === true).length === 0 || actionLoading}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : currentPageUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => user.is_farmer === true && handleSelectUser(user.id)}
                          className="rounded border-gray-300"
                          disabled={actionLoading || user.is_admin === true}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {user.full_name?.charAt(0) || user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
                            </p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{user.email}</span>
                          </div>
                          {user.phone && user.phone !== '-' && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge user={user} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{user.district || user.farm_district || user.location || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <UserStatusBadge user={user} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setShowDetailModal(true);
                            }} className="gap-2 cursor-pointer">
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.is_farmer === true && (
                              <DropdownMenuItem onClick={() => {
                                setUserToChangeRole(user);
                                setShowRoleChangeDialog(true);
                              }} className="gap-2 cursor-pointer">
                                <Crown className="w-4 h-4 text-purple-600" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteDialog(true);
                            }} className="gap-2 text-red-600 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t flex-wrap gap-3">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + pagination.page_size, users.length)} of {users.length} users
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1 || actionLoading} className="h-8 text-xs">
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pagination.total_pages > 5) {
                      if (pagination.page > 3) {
                        pageNum = pagination.page - 2 + i;
                        if (pageNum > pagination.total_pages) return null;
                      }
                    }
                    return pageNum && (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={actionLoading}
                        className={`h-8 w-8 text-xs ${pagination.page === pageNum ? "bg-emerald-600" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.total_pages || actionLoading} className="h-8 text-xs">
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* User Detail Modal */}
        {selectedUser && (
          <UserDetailModal
            open={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedUser(null);
            }}
            userId={selectedUser.id}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Role Change Confirmation Dialog */}
        <AlertDialog open={showRoleChangeDialog} onOpenChange={setShowRoleChangeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Promote to Admin?</AlertDialogTitle>
              <AlertDialogDescription>
                This will promote {userToChangeRole?.full_name || userToChangeRole?.username} to Admin.
                They will gain full admin privileges.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRoleChange} className="bg-purple-600 hover:bg-purple-700" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Promote to Admin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default UserList;