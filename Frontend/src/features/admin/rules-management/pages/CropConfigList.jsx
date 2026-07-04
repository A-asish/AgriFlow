// src/features/admin/rules-management/pages/CropConfigList.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { Sliders, Plus, Edit2, Trash2, ClipboardList, ShieldAlert, CheckCircle2, XCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';
import CropManagementTabs from '../../crops-management/components/CropManagementTabs';

const PAGE_SIZE = 10;

// Hoisted outside component — stable reference, no re-creation on each render
const INITIAL_PARAMS = {
    crop_name: '',
    region: '',
    season: '',
    is_active: '',
    page: 1,
    page_size: PAGE_SIZE,
};

const CropConfigList = () => {
    const navigate = useNavigate();
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ region: '', season: '', is_active: '' });

    // Stable fetchFn — prevents infinite re-fetch loop in useAdminData
    const fetchCropConfigs = useCallback((p) => adminService.listCropConfigs(p), []);

    const { data: configs, loading, setParams, refresh, pagination } = useAdminData({
        fetchFn: fetchCropConfigs,
        initialParams: INITIAL_PARAMS,
    });

    // useAdminData already unwraps the response into a plain array
    const dataArray = Array.isArray(configs) ? configs : [];

    const totalItems = pagination?.total ?? dataArray.length;
    const totalPages = pagination?.total_pages ?? Math.ceil(totalItems / PAGE_SIZE);
    const currentPage = pagination?.page ?? 1;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSearch = (term) => {
        setParams({ crop_name: term, page: 1 });
    };

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
        setParams({ [key]: value, page: 1 });
    };

    const handleClearFilter = (key) => {
        setActiveFilters(prev => ({ ...prev, [key]: '' }));
        setParams({ [key]: '', page: 1 });
    };

    const handleClearFilters = () => {
        setActiveFilters({ region: '', season: '', is_active: '' });
        setParams({ region: '', season: '', is_active: '', page: 1 });
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setParams({ page: newPage });
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

    // ── Badge helpers ─────────────────────────────────────────────────────────

    const getRegionBadge = (region) => {
        const styles = {
            terai: 'bg-orange-50 text-orange-700 border-orange-200',
            hilly: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            himalayan: 'bg-blue-50 text-blue-700 border-blue-200',
        };
        return (
            <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border capitalize", styles[region] || 'bg-slate-50 text-slate-700 border-slate-200')}>
                {region || 'Any'}
            </span>
        );
    };

    const getSeasonBadge = (season) => {
        const styles = {
            spring: 'bg-pink-50 text-pink-700 border-pink-100',
            summer: 'bg-rose-50 text-rose-700 border-rose-100',
            monsoon: 'bg-sky-50 text-sky-700 border-sky-100',
            autumn: 'bg-orange-50 text-orange-700 border-orange-100',
            winter: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        };
        return (
            <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md border capitalize", styles[season] || 'bg-slate-50 text-slate-700 border-slate-100')}>
                {season || 'Any'}
            </span>
        );
    };

    const getFilterLabel = (key, value) => {
        const labels = {
            region: { terai: 'Terai', hilly: 'Hilly', himalayan: 'Himalayan' },
            season: { spring: 'Spring', summer: 'Summer', monsoon: 'Monsoon', autumn: 'Autumn', winter: 'Winter' },
            is_active: { true: 'Active', false: 'Inactive' },
        };
        return labels[key]?.[value] || value;
    };

    // ── Pagination page numbers ───────────────────────────────────────────────

    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }
        if (currentPage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    // ── Columns ───────────────────────────────────────────────────────────────

    const columns = [
        {
            header: 'Crop Configuration',
            accessor: (c) => (
                <div className="space-y-1">
                    <p className="font-extrabold text-slate-800 text-sm">
                        {c.crop_name}
                        {c.variety && <span className="ml-1.5 text-xs text-slate-400 font-bold">({c.variety})</span>}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {getSeasonBadge(c.season)}
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
            header: 'Region',
            accessor: (c) => getRegionBadge(c.region),
        },
        {
            header: 'Lifecycle Stages (Days)',
            accessor: (c) => (
                <div className="space-y-1.5 max-w-70">
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
                        Total: <span className="text-slate-700">{c.total_growing_days} Days</span>
                    </p>
                </div>
            ),
        },
        {
            header: 'Status',
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
                        <ClipboardList className="w-3.5 h-3.5" /> Rules
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                        onClick={() => navigate(`/admin/crop-configs/${c.id}`)}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        onClick={() => setDeleteId(c.id)}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    const hasActiveFilters = Object.values(activeFilters).some(v => v !== '');

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
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
                    <Button
                        onClick={() => navigate('/admin/crop-configs/new')}
                        className="w-full sm:w-auto rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" /> Add Configuration
                    </Button>
                </div>

                <CropManagementTabs activeTab="configs" />

                {/* Search & Filters */}
                <div className="space-y-3">
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
                                ],
                            },
                            {
                                label: 'All Seasons',
                                value: 'season',
                                options: [
                                    { label: 'Spring', value: 'spring' },
                                    { label: 'Summer', value: 'summer' },
                                    { label: 'Monsoon', value: 'monsoon' },
                                    { label: 'Autumn', value: 'autumn' },
                                    { label: 'Winter', value: 'winter' },
                                ],
                            },
                            {
                                label: 'All Status',
                                value: 'is_active',
                                options: [
                                    { label: 'Active', value: 'true' },
                                    { label: 'Inactive', value: 'false' },
                                ],
                            },
                        ]}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters:</span>
                            {Object.entries(activeFilters).map(([key, value]) => {
                                if (!value) return null;
                                return (
                                    <span
                                        key={key}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm"
                                    >
                                        {key === 'is_active' ? 'Status' : key.charAt(0).toUpperCase() + key.slice(1)}: {getFilterLabel(key, value)}
                                        <button onClick={() => handleClearFilter(key)} className="hover:text-rose-500 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg px-3 py-1.5 h-auto"
                            >
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>

                {/* Results summary */}
                <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>
                        Showing <span className="font-bold text-slate-700">{dataArray.length}</span> of{' '}
                        <span className="font-bold text-slate-700">{totalItems}</span> configurations
                    </span>
                    {totalPages > 1 && (
                        <span>
                            Page <span className="font-bold text-slate-700">{currentPage}</span> of{' '}
                            <span className="font-bold text-slate-700">{totalPages}</span>
                        </span>
                    )}
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={dataArray}
                    loading={loading}
                    emptyMessage="No crop configurations found."
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-400">
                            {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems} entries
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || loading}
                                className="rounded-xl font-bold gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </Button>

                            {getPageNumbers().map((page, idx) =>
                                page === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold select-none">…</span>
                                ) : (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePageChange(page)}
                                        disabled={loading}
                                        className={cn(
                                            "rounded-xl font-bold min-w-9",
                                            currentPage === page
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                                                : "text-slate-600"
                                        )}
                                    >
                                        {page}
                                    </Button>
                                )
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages || loading}
                                className="rounded-xl font-bold gap-1"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
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