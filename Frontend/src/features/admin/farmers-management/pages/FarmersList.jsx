import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
    Plus, Download, MoreVertical, Eye, Edit, Trash2, 
    UserCheck, UserX, Mail, Phone, MapPin, Calendar as CalendarIcon, 
    Shield, MailCheck, MailX, BadgeCheck 
} from 'lucide-react';
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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentFarmer, setCurrentFarmer] = useState(null);

    // Check if adminService has listFarmers method
    const fetchFarmers = async (params) => {
        console.log('Fetching farmers with params:', params);
        if (adminService && typeof adminService.listFarmers === 'function') {
            return await adminService.listFarmers(params);
        } else {
            console.error('adminService.listFarmers is not a function');
            // Fallback: try to use getUsers method
            if (adminService && typeof adminService.getUsers === 'function') {
                return await adminService.getUsers({ ...params, role: 'farmer' });
            }
            return { farmers: [] };
        }
    };

    const { data: farmersData, loading, params, setParams, refresh } = useAdminData({
        fetchFn: fetchFarmers
    });

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
            if (adminService && typeof adminService.bulkActionFarmers === 'function') {
                await adminService.bulkActionFarmers({ farmer_ids: [id], action });
                toast.success(`Farmer ${action}d successfully`);
                refresh();
            } else {
                toast.error('Status update not available');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleResendVerification = async (email) => {
        try {
            if (adminService && typeof adminService.resendVerificationEmail === 'function') {
                await adminService.resendVerificationEmail({ email });
                toast.success('Verification email sent successfully');
            } else {
                toast.error('Resend verification not available');
            }
        } catch (error) {
            console.error('Error resending verification:', error);
            toast.error('Failed to send verification email');
        }
    };

    // Helper function to get farmer status
    const getFarmerStatus = (farmer) => {
        if (!farmer) return 'Pending';
        if (!farmer.is_active) return 'Inactive';
        if (!farmer.is_email_verified) return 'Pending';
        return 'Active';
    };

    const columns = [
        {
            header: 'Farmer',
            accessor: (f) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                        {getInitials(f.full_name || f.username)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 leading-tight">{f.full_name || f.username}</p>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">@{f.username}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Farm Info',
            accessor: (f) => (
                <div>
                    <p className="text-sm font-bold text-slate-700">{f.farm_name || '—'}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        <MapPin className="w-3 h-3"/> {f.geographical_region || f.district || 'Not set'}
                    </div>
                </div>
            ),
        },
        {
            header: 'Contact',
            accessor: (f) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Mail className="w-3 h-3"/> {f.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Phone className="w-3 h-3"/> {f.phone || '—'}
                    </div>
                </div>
            ),
        },
        {
            header: 'Account Status',
            headerClassName: 'text-center',
            className: 'text-center',
            accessor: (f) => {
                const status = getFarmerStatus(f);
                return <StatusBadge status={status} />;
            },
        },
        {
            header: 'Email Verification',
            headerClassName: 'text-center',
            className: 'text-center',
            accessor: (f) => (
                <div className="flex items-center justify-center gap-2">
                    {f.is_email_verified ? (
                        <>
                            <MailCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600">Verified</span>
                        </>
                    ) : (
                        <>
                            <MailX className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-600">Unverified</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            header: 'Role',
            headerClassName: 'text-center',
            className: 'text-center',
            accessor: (f) => (
                <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-600">
                        {f.is_admin ? 'Admin' : 'Farmer'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            accessor: (f) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="w-4 h-4 text-slate-400"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl w-56 shadow-xl border-slate-100 p-2">
                        <DropdownMenuItem onClick={() => handleView(f)} className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
                            <Eye className="w-4 h-4 text-emerald-500"/> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(f)} className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
                            <Edit className="w-4 h-4 text-blue-500"/> Edit Profile
                        </DropdownMenuItem>
                        
                        {!f.is_email_verified && (
                            <DropdownMenuItem onClick={() => handleResendVerification(f.email)} className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
                                <Mail className="w-4 h-4 text-purple-500"/> Resend Verification
                            </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => handleToggleStatus(f.id, getFarmerStatus(f))} className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
                            {f.is_active ? (
                                <><UserX className="w-4 h-4 text-rose-500"/> Deactivate Account</>
                            ) : (
                                <><UserCheck className="w-4 h-4 text-emerald-500"/> Activate Account</>
                            )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="my-1 bg-slate-50"/>
                        <DropdownMenuItem className="rounded-xl gap-3 font-bold text-rose-500 cursor-pointer p-2.5 hover:bg-rose-50">
                            <Trash2 className="w-4 h-4"/> Delete Farmer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    // Get the farmers array safely
    const farmers = farmersData?.farmers || farmersData?.users || farmersData || [];

    return (
        <AdminLayout>
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

                <SearchFilter 
                    onSearch={handleSearch} 
                    placeholder="Search by name, email, or username..." 
                    filters={[
                        {
                            label: 'Account Status',
                            value: 'status',
                            options: [
                                { label: 'Active', value: 'active' },
                                { label: 'Inactive', value: 'inactive' },
                                { label: 'Pending', value: 'pending' },
                            ]
                        },
                        {
                            label: 'Email Verification',
                            value: 'email_verified',
                            options: [
                                { label: 'Verified', value: 'verified' },
                                { label: 'Unverified', value: 'unverified' },
                            ]
                        },
                        {
                            label: 'Role',
                            value: 'role',
                            options: [
                                { label: 'Farmer', value: 'farmer' },
                                { label: 'Admin', value: 'admin' },
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
                    ]} 
                    onFilterChange={handleFilterChange}
                />

                <DataTable 
                    columns={columns} 
                    data={farmers} 
                    loading={loading} 
                    emptyMessage="No farmers found in the network."
                />

                {/* View Modal */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0">
                        {currentFarmer && (
                            <>
                                <div className="h-32 bg-emerald-600 relative">
                                    <div className="absolute -bottom-12 left-8 p-1.5 bg-white rounded-3xl shadow-xl">
                                        <div className="w-24 h-24 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl font-black text-emerald-600">
                                            {currentFarmer?.full_name?.[0] || currentFarmer?.username?.[0]}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-16 pb-8 px-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800">{currentFarmer?.full_name || currentFarmer?.username}</h2>
                                            <p className="text-slate-400 font-bold tracking-tight">Farmer ID: #FMR-{currentFarmer?.id?.toString().padStart(4, '0')}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <StatusBadge status={getFarmerStatus(currentFarmer)} className="px-4 py-1.5 uppercase tracking-widest text-[10px]"/>
                                            {currentFarmer?.is_admin && (
                                                <StatusBadge status="Admin" className="px-4 py-1.5 uppercase tracking-widest text-[10px] bg-purple-50 text-purple-700"/>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Account Info</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <Mail className="w-4 h-4 text-emerald-500"/>
                                                    <span className="font-bold">{currentFarmer?.email}</span>
                                                    {currentFarmer?.is_email_verified ? (
                                                        <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <MailX className="w-4 h-4 text-amber-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <Phone className="w-4 h-4 text-emerald-500"/>
                                                    <span className="font-bold">{currentFarmer?.phone || 'Not provided'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <Shield className="w-4 h-4 text-emerald-500"/>
                                                    <span className="font-bold">Role: {currentFarmer?.is_admin ? 'Administrator' : 'Farmer'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Farm Context</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <MapPin className="w-4 h-4 text-emerald-500"/>
                                                    <span className="font-bold capitalize">{currentFarmer?.geographical_region || currentFarmer?.district || 'Not specified'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <div className="text-emerald-500 font-black text-[10px]">FARM</div>
                                                    <span className="font-bold">{currentFarmer?.farm_name || 'No farm registered'}</span>
                                                </div>
                                                {currentFarmer?.total_farm_area && (
                                                    <div className="flex items-center gap-3 text-slate-600">
                                                        <div className="text-emerald-500 font-black text-[10px]">AREA</div>
                                                        <span className="font-bold">{currentFarmer?.total_farm_area} hectares</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CalendarIcon className="w-4 h-4"/>
                                            <span className="text-sm font-bold">Joined: {formatDate(currentFarmer?.date_joined)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {!currentFarmer?.is_email_verified && (
                                                <Button 
                                                    variant="outline" 
                                                    className="rounded-xl font-bold gap-2"
                                                    onClick={() => handleResendVerification(currentFarmer?.email)}
                                                >
                                                    <Mail className="w-4 h-4"/> Resend Verification
                                                </Button>
                                            )}
                                            <Button className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsViewModalOpen(false)}>
                                                Close View
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default Farmers;