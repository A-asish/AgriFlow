import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { Sliders, Plus, Edit2, Trash2, Calendar, ClipboardList, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';

const CropConfigList = () => {
    const navigate = useNavigate();
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: configs, loading, setParams, refresh } = useAdminData({
        fetchFn: (p) => adminService.listCropConfigs(p),
        initialParams: { crop_name: '', region: '' }
    });

    const handleSearch = (term) => {
        setParams({ crop_name: term });
        refresh();
    };

    const handleFilterChange = (key, value) => {
        setParams({ [key]: value });
        refresh();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await adminService.deleteCropConfig(deleteId);
            toast.success("Crop Configuration deleted successfully");
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete configuration");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const getRegionBadge = (region) => {
        const regions = {
            terai: 'bg-orange-50 text-orange-700 border-orange-200',
            hilly: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            himalayan: 'bg-blue-50 text-blue-700 border-blue-200',
        };
        return (
            <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border capitalize", regions[region] || 'bg-slate-50 text-slate-700 border-slate-200')}>
                {region || 'Any'}
            </span>
        );
    };

    const columns = [
        {
            header: 'Crop Configuration',
            accessor: (c) => (
                <div className="space-y-1">
                    <p className="font-extrabold text-slate-800 text-sm">
                        {c.crop_name} 
                        {c.variety && <span className="ml-1.5 text-xs text-slate-400 font-bold">({c.variety})</span>}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                            {c.season || 'Any Season'}
                        </span>
                        {!c.is_active && (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded uppercase">
                                Inactive
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: 'Geographical Region',
            accessor: (c) => getRegionBadge(c.region),
        },
        {
            header: 'Lifecycle Stages (Days)',
            accessor: (c) => (
                <div className="space-y-1.5 max-w-[280px]">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600" title="Germination">
                            🌱 {c.germination_start_day}-{c.germination_end_day}d
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700" title="Vegetative">
                            🌿 {c.vegetative_start_day}-{c.vegetative_end_day}d
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-50 text-pink-700" title="Flowering">
                            🌸 {c.flowering_start_day}-{c.flowering_end_day}d
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700" title="Maturation">
                            🍎 {c.maturation_start_day}-{c.maturation_end_day}d
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700" title="Harvest">
                            ✂️ {c.harvest_start_day}-{c.harvest_end_day}d
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Total Cultivation: <span className="text-slate-700">{c.total_growing_days} Days</span>
                    </p>
                </div>
            ),
        },
        {
            header: 'Active State',
            accessor: (c) => (
                <div className="flex items-center gap-1.5">
                    {c.is_active ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600">Active</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 text-slate-300" />
                            <span className="text-xs font-semibold text-slate-400">Inactive</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            header: 'Actions',
            className: 'text-right',
            headerClassName: 'text-right',
            accessor: (c) => (
                <div className="flex justify-end items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-bold gap-1 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all h-8.5"
                        onClick={() => navigate(`/admin/crop-configs/${c.id}/rules`)}
                    >
                        <ClipboardList className="w-3.5 h-3.5"/> Manage Rules
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8.5 w-8.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                        onClick={() => navigate(`/admin/crop-configs/${c.id}`)}
                    >
                        <Edit2 className="w-3.5 h-3.5"/>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8.5 w-8.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        onClick={() => setDeleteId(c.id)}
                    >
                        <Trash2 className="w-3.5 h-3.5"/>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Sliders className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Platform Engine</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Crop Lifecycle Configurations</h1>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Configure crop growth stages and activity rule maps for different regions & varieties.</p>
                    </div>
                    <div>
                        <Button 
                            onClick={() => navigate('/admin/crop-configs/new')}
                            className="w-full sm:w-auto rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4"/> Add Configuration
                        </Button>
                    </div>
                </div>

                <SearchFilter 
                    onSearch={handleSearch} 
                    placeholder="Search configs by crop name..." 
                    filters={[
                        {
                            label: 'All Regions',
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
                    data={configs || []} 
                    loading={loading} 
                    emptyMessage="No crop configurations found."
                />
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl max-w-md">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <AlertDialogTitle className="text-xl font-extrabold text-slate-800">Delete Configuration?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium text-sm">
                            Are you sure you want to delete this crop configuration? All associated crop activity rules will also be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold text-slate-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            disabled={isDeleting}
                            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Configuration'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default CropConfigList;
