import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { BookOpen, Plus, Search, Edit2, Trash2, ShieldAlert, Sparkles, Sprout } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';

const KnowledgeBaseList = () => {
    const navigate = useNavigate();
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: kbData, loading, setParams, refresh } = useAdminData({
        fetchFn: (p) => adminService.listKnowledgeBase(p),
        initialParams: { search: '', category: '', season: '' }
    });

    const handleSearch = (term) => {
        setParams({ search: term });
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
            await adminService.deleteKnowledgeBase(deleteId);
            toast.success("Knowledge Base entry deleted successfully");
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete entry");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const getCategoryBadge = (cat) => {
        const categories = {
            cereal: { label: 'Cereal', style: 'bg-amber-50 text-amber-700 border-amber-200' },
            pulse: { label: 'Pulse', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            cash_crop: { label: 'Cash Crop', style: 'bg-blue-50 text-blue-700 border-blue-200' },
            vegetable: { label: 'Vegetable', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        };
        const active = categories[cat] || { label: cat, style: 'bg-slate-50 text-slate-700 border-slate-200' };
        return (
            <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border", active.style)}>
                {active.label}
            </span>
        );
    };

    const getSeasonBadge = (season) => {
        const seasons = {
            spring: 'bg-pink-50 text-pink-700 border-pink-100',
            monsoon: 'bg-sky-50 text-sky-700 border-sky-100',
            autumn: 'bg-orange-50 text-orange-700 border-orange-100',
            winter: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        };
        return (
            <span className={cn("px-2 py-0.5 text-[11px] font-bold rounded-md border capitalize", seasons[season] || 'bg-slate-50 text-slate-700 border-slate-100')}>
                {season}
            </span>
        );
    };

    const columns = [
        {
            header: 'Crop Details',
            accessor: (c) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                        <Sprout className="w-5 h-5"/>
                    </div>
                    <div>
                        <p className="font-extrabold text-slate-800 text-sm">{c.name_en}</p>
                        {c.name_np && <p className="text-xs font-semibold text-slate-400">{c.name_np}</p>}
                    </div>
                </div>
            ),
        },
        {
            header: 'Category',
            accessor: (c) => getCategoryBadge(c.category),
        },
        {
            header: 'Best Season',
            accessor: (c) => getSeasonBadge(c.best_season),
        },
        {
            header: 'Temp Range',
            accessor: (c) => (
                <div className="text-xs font-bold text-slate-600">
                    <span className="text-blue-500">{c.temp_min}°C</span>
                    <span className="text-slate-300 mx-1.5">-</span>
                    <span className="text-rose-500">{c.temp_max}°C</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Ideal: {c.temp_ideal}°C</span>
                </div>
            ),
        },
        {
            header: 'pH Requirements',
            accessor: (c) => (
                <div className="text-xs font-bold text-slate-600">
                    <span>{c.ph_min} - {c.ph_max}</span>
                    <span className="block text-[10px] text-emerald-600 font-black">Ideal: {c.ph_ideal}</span>
                </div>
            ),
        },
        {
            header: 'Suitable Regions',
            accessor: (c) => (
                <div className="max-w-[150px] truncate text-xs font-semibold text-slate-500" title={c.region_suitable}>
                    {c.region_suitable?.split(',').map((r, i) => (
                        <span key={i} className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 mb-1 capitalize">
                            {r.trim()}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            header: 'Actions',
            className: 'text-right',
            headerClassName: 'text-right',
            accessor: (c) => (
                <div className="flex justify-end items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8.5 w-8.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                        onClick={() => navigate(`/admin/knowledge-base/${c.id}`)}
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
                                <BookOpen className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Recommendation Data</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Crop Knowledge Base</h1>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Configure agricultural parameters used for the recommendation engine.</p>
                    </div>
                    <div>
                        <Button 
                            onClick={() => navigate('/admin/knowledge-base/new')}
                            className="w-full sm:w-auto rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4"/> Add Crop Profile
                        </Button>
                    </div>
                </div>

                <SearchFilter 
                    onSearch={handleSearch} 
                    placeholder="Search crop profiles by English/Nepali name..." 
                    filters={[
                        {
                            label: 'All Categories',
                            value: 'category',
                            options: [
                                { label: 'Cereal', value: 'cereal' },
                                { label: 'Pulse', value: 'pulse' },
                                { label: 'Cash Crop', value: 'cash_crop' },
                                { label: 'Vegetable', value: 'vegetable' },
                            ]
                        },
                        {
                            label: 'All Seasons',
                            value: 'season',
                            options: [
                                { label: 'Spring', value: 'spring' },
                                { label: 'Monsoon', value: 'monsoon' },
                                { label: 'Autumn', value: 'autumn' },
                                { label: 'Winter', value: 'winter' },
                            ]
                        }
                    ]} 
                    onFilterChange={handleFilterChange}
                />

                <DataTable 
                    columns={columns} 
                    data={kbData || []} 
                    loading={loading} 
                    emptyMessage="No crop profiles in the knowledge base."
                />
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl max-w-md">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <AlertDialogTitle className="text-xl font-extrabold text-slate-800">Delete Crop Profile?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium text-sm">
                            Are you sure you want to delete this crop profile from the Knowledge Base? This action is permanent and will affect crop suggestions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold text-slate-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            disabled={isDeleting}
                            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default KnowledgeBaseList;
