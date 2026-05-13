import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Download, MoreVertical, Eye, Edit, Trash2, UserCheck, UserX, Mail, Phone, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getInitials } from '../../utils/helpers';
import { toast } from 'sonner';
const Farmers = () => {
    const { data: farmersData, loading, params, setParams, refresh } = useAdminData({
        fetchFn: (p) => adminService.listFarmers(p)
    });
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentFarmer, setCurrentFarmer] = useState(null);
    const handleSearch = (term) => {
        setParams({ search: term, page: 1 });
        refresh();
    };
    const handleFilterChange = (key, value) => {
        setParams({ [key]: value, page: 1 });
        refresh();
    };
    const handleView = (farmer) => {
        setCurrentFarmer(farmer);
        setIsViewModalOpen(true);
    };
    const handleEdit = (farmer) => {
        setCurrentFarmer(farmer);
        setIsEditModalOpen(true);
    };
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
            await adminService.bulkActionFarmers({ farmer_ids: [id], action });
            toast.success(`Farmer ${action}d successfully`);
            refresh();
        }
        catch (error) {
            toast.error('Failed to update status');
        }
    };
    const columns = [
        {
            header: 'Farmer',
            accessor: (f) => (<div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
            {getInitials(f.full_name)}
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-tight">{f.full_name}</p>
            <p className="text-xs text-slate-400 font-medium tracking-tight">@{f.username}</p>
          </div>
        </div>),
        },
        {
            header: 'Farm Info',
            accessor: (f) => (<div>
          <p className="text-sm font-bold text-slate-700">{f.farm_name}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            <MapPin className="w-3 h-3"/> {f.region}
          </div>
        </div>),
        },
        {
            header: 'Contact',
            accessor: (f) => (<div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Mail className="w-3 h-3"/> {f.email}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Phone className="w-3 h-3"/> {f.phone}
          </div>
        </div>),
        },
        {
            header: 'Status',
            headerClassName: 'text-center',
            className: 'text-center',
            accessor: (f) => <StatusBadge status={f.status}/>,
        },
        {
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            accessor: (f) => (<DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="w-4 h-4 text-slate-400"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-slate-100 p-2">
            <DropdownMenuItem onClick={() => handleView(f)} className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
              <Eye className="w-4 h-4 text-emerald-500"/> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(f)} className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
              <Edit className="w-4 h-4 text-blue-500"/> Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(f.id, f.status)} className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
              {f.status === 'Active' ? (<><UserX className="w-4 h-4 text-rose-500"/> Deactivate Account</>) : (<><UserCheck className="w-4 h-4 text-emerald-500"/> Activate Account</>)}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-50"/>
            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-rose-500 cursor-pointer p-2.5 hover:bg-rose-50">
              <Trash2 className="w-4 h-4"/> Delete Farmer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>),
        },
    ];
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Farmer Network</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Manage and monitor all agricultural participants on the platform.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100">
              <Plus className="w-4 h-4"/> Add Farmer
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold gap-2">
              <Download className="w-4 h-4"/> Export
            </Button>
          </div>
        </div>

        <SearchFilter onSearch={handleSearch} placeholder="Search by name, email, or username..." filters={[
            {
                label: 'Status',
                value: 'status',
                options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Pending', value: 'pending' },
                ]
            },
            {
                label: 'Region',
                value: 'region',
                options: [
                    { label: 'Terai', value: 'terai' },
                    { label: 'Hilly', value: 'hilly' },
                    { label: 'Himalayan', value: 'himalayan' },
                ]
            }
        ]} onFilterChange={handleFilterChange}/>

        <DataTable columns={columns} data={farmersData?.farmers || []} loading={loading} emptyMessage="No farmers found in the network."/>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0">
            <div className="h-32 bg-emerald-600 relative">
               <div className="absolute -bottom-12 left-8 p-1.5 bg-white rounded-3xl shadow-xl">
                 <div className="w-24 h-24 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl font-black text-emerald-600">
                    {currentFarmer?.full_name?.[0]}
                 </div>
               </div>
            </div>
            
            <div className="pt-16 pb-8 px-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{currentFarmer?.full_name}</h2>
                  <p className="text-slate-400 font-bold tracking-tight">Farmer ID: #FMR-{currentFarmer?.id?.toString().padStart(4, '0')}</p>
                </div>
                <StatusBadge status={currentFarmer?.status || ''} className="px-4 py-1.5 uppercase tracking-widest text-[10px]"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Account Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-4 h-4 text-emerald-500"/>
                      <span className="font-bold">{currentFarmer?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="w-4 h-4 text-emerald-500"/>
                      <span className="font-bold">{currentFarmer?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Farm Context</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 text-slate-600">
                       <MapPin className="w-4 h-4 text-emerald-500"/>
                       <span className="font-bold">{currentFarmer?.region}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                       <div className="text-emerald-500 font-black text-[10px]">FARM</div>
                       <span className="font-bold">{currentFarmer?.farm_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <CalendarIcon className="w-4 h-4"/>
                  <span className="text-sm font-bold">Joined: {formatDate(currentFarmer?.date_joined)}</span>
                </div>
                <Button className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsViewModalOpen(false)}>Close View</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>);
};
export default Farmers;
