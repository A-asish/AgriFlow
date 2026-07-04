// src/features/admin/crops-management/pages/CropActivityRules.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    ArrowLeft, Plus, Edit2, Trash2, ShieldAlert,
    CheckCircle2, XCircle, Sprout, Save, Loader2,
    Calendar, Clock, ChevronRight
} from 'lucide-react';
import adminService from '../../services/admin.api';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '@/shared/components/ui/alert-dialog';

const STAGES = [
    { value: 'germination', label: 'Germination', icon: '🌱', color: 'emerald' },
    { value: 'vegetative',  label: 'Vegetative',  icon: '🌿', color: 'blue'    },
    { value: 'flowering',   label: 'Flowering',   icon: '🌸', color: 'pink'    },
    { value: 'maturation',  label: 'Maturation',  icon: '🍎', color: 'amber'   },
    { value: 'harvest',     label: 'Harvest',     icon: '✂️', color: 'purple'  },
];

const STAGE_BADGE_COLORS = {
    germination: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    vegetative:  'bg-blue-50 text-blue-700 border-blue-200',
    flowering:   'bg-pink-50 text-pink-700 border-pink-200',
    maturation:  'bg-amber-50 text-amber-700 border-amber-200',
    harvest:     'bg-purple-50 text-purple-700 border-purple-200',
};

const EMPTY_FORM = {
    growth_stage: 'germination',
    title: '',
    title_np: '',
    description: '',
    description_np: '',
    measurements: '',
    target_pest: '',
    recommendations: '',
    day_offset: 0,
    order: 0,
    is_active: true,
};

// Safely extract an array from whatever the API returns
const extractArray = (responseData) => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData.data)) return responseData.data;
    if (Array.isArray(responseData.results)) return responseData.results;
    return [];
};

const CropActivityRules = () => {
    const { configId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [rules, setRules] = useState([]);
    const [activeStage, setActiveStage] = useState('germination');
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [configRes, rulesRes] = await Promise.all([
                adminService.getCropConfigDetail(configId),
                adminService.listCropActivityRules({ crop_config: configId }),
            ]);
            setConfig(configRes.data);
            setRules(extractArray(rulesRes.data));
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('Failed to load crop configuration');
            navigate('/admin/crop-configs');
        } finally {
            setLoading(false);
        }
    }, [configId, navigate]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Stage helpers ────────────────────────────────────────────────────────

    const getStageDays = (stage) => {
        if (!config) return null;
        const map = {
            germination: { start: config.germination_start_day, end: config.germination_end_day },
            vegetative:  { start: config.vegetative_start_day,  end: config.vegetative_end_day  },
            flowering:   { start: config.flowering_start_day,   end: config.flowering_end_day   },
            maturation:  { start: config.maturation_start_day,  end: config.maturation_end_day  },
            harvest:     { start: config.harvest_start_day,     end: config.harvest_end_day     },
        };
        return map[stage] || null;
    };

    const stageRules = rules.filter(r => r.growth_stage === activeStage)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // ── Modal helpers ────────────────────────────────────────────────────────

    const openAddModal = () => {
        setEditingRule(null);
        setForm({ ...EMPTY_FORM, growth_stage: activeStage, order: stageRules.length });
        setIsModalOpen(true);
    };

    const openEditModal = (rule) => {
        setEditingRule(rule);
        setForm({
            growth_stage: rule.growth_stage,
            title: rule.title || '',
            title_np: rule.title_np || '',
            description: rule.description || '',
            description_np: rule.description_np || '',
            measurements: rule.measurements || '',
            target_pest: rule.target_pest || '',
            recommendations: rule.recommendations || '',
            day_offset: rule.day_offset ?? 0,
            order: rule.order ?? 0,
            is_active: rule.is_active ?? true,
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) { toast.error("Title is required"); return; }
        if (!form.description.trim()) { toast.error("Description is required"); return; }

        setSaving(true);
        try {
            const payload = { ...form, crop_config: configId };
            if (editingRule) {
                await adminService.updateCropActivityRule(editingRule.id, payload);
                toast.success("Activity updated successfully");
            } else {
                await adminService.createCropActivityRule(payload);
                toast.success("Activity added successfully");
            }
            // Refresh rules list
            const rulesRes = await adminService.listCropActivityRules({ crop_config: configId });
            setRules(extractArray(rulesRes.data));
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving rule:', err);
            toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to save activity");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await adminService.deleteCropActivityRule(deleteId);
            toast.success("Activity deleted successfully");
            setRules(prev => prev.filter(r => r.id !== deleteId));
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete activity");
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    // ── Loading / not found ──────────────────────────────────────────────────

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                </div>
            </AdminLayout>
        );
    }

    if (!config) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-slate-500 font-medium">Configuration not found</p>
                    <Button onClick={() => navigate('/admin/crop-configs')} className="mt-4">
                        Back to Configs
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    const currentDays = getStageDays(activeStage);
    const currentStage = STAGES.find(s => s.value === activeStage);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <AdminLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/admin/crop-configs')}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Configurations
                        </button>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Sprout className="w-5 h-5" />
                            </span>
                            <h1 className="text-2xl font-extrabold text-slate-800">
                                {config.crop_name}
                                {config.variety && <span className="text-slate-400 ml-1">({config.variety})</span>}
                            </h1>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full capitalize">
                                {config.region} • {config.season || 'Any Season'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Manage day-wise activities and recommendations for each growth stage.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/crop-configs/${configId}`)}
                        className="rounded-xl font-bold gap-1 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shrink-0"
                    >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Config
                    </Button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400 line-through">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">✓</span>
                        Configure Stages
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
                        Add Activities
                    </span>
                </div>

                {/* Stage tabs */}
                <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    {STAGES.map((stage) => {
                        const isActive = activeStage === stage.value;
                        const count = rules.filter(r => r.growth_stage === stage.value).length;
                        const days = getStageDays(stage.value);
                        return (
                            <button
                                key={stage.value}
                                onClick={() => setActiveStage(stage.value)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex-1 sm:flex-none justify-center",
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-md"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                )}
                            >
                                <span>{stage.icon}</span>
                                <span className="hidden sm:inline">{stage.label}</span>
                                {days && (
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-black hidden md:inline",
                                        isActive ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {days.start}–{days.end}d
                                    </span>
                                )}
                                <span className={cn(
                                    "text-[10px] w-5 h-5 rounded-full font-black flex items-center justify-center",
                                    isActive ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500",
                                    count > 0 && !isActive ? "bg-emerald-100 text-emerald-700" : ""
                                )}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Stage info bar */}
                {currentDays && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">{currentStage?.icon} {currentStage?.label} Stage:</span>
                        <span>Day {currentDays.start} – {currentDays.end}</span>
                        <span className="text-slate-400">({currentDays.end - currentDays.start + 1} days)</span>
                        <Button
                            size="sm"
                            onClick={openAddModal}
                            className="ml-auto rounded-xl font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Activity
                        </Button>
                    </div>
                )}

                {/* Rules list */}
                <Card className="border-slate-100 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        {stageRules.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="text-5xl mb-4">{currentStage?.icon}</div>
                                <p className="text-slate-600 font-bold text-base mb-1">
                                    No activities for {currentStage?.label} stage yet
                                </p>
                                <p className="text-slate-400 text-sm mb-6">
                                    Day {currentDays?.start} – {currentDays?.end} • Add tasks, reminders, and recommendations farmers should follow during this stage.
                                </p>
                                <Button
                                    onClick={openAddModal}
                                    className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
                                >
                                    <Plus className="w-4 h-4" /> Add First Activity
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {stageRules.map((rule, idx) => (
                                    <div key={rule.id} className="p-5 hover:bg-slate-50/60 transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-3 flex-1 min-w-0">
                                                {/* Order number */}
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </div>

                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-extrabold text-slate-800 text-sm">{rule.title}</h4>
                                                        {rule.title_np && (
                                                            <span className="text-xs text-slate-400 font-semibold">({rule.title_np})</span>
                                                        )}
                                                        {!rule.is_active && (
                                                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                                Inactive
                                                            </span>
                                                        )}
                                                        {rule.day_offset > 0 ? (
                                                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> Day +{rule.day_offset}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded">
                                                                Any day
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
                                                    {rule.description_np && (
                                                        <p className="text-xs text-slate-400 leading-relaxed italic">{rule.description_np}</p>
                                                    )}

                                                    {/* Tags */}
                                                    {(rule.measurements || rule.target_pest || rule.recommendations) && (
                                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                            {rule.measurements && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                                    ⚖️ {rule.measurements}
                                                                </span>
                                                            )}
                                                            {rule.target_pest && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">
                                                                    🐛 {rule.target_pest}
                                                                </span>
                                                            )}
                                                            {rule.recommendations && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                                                    💡 {rule.recommendations}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={() => openEditModal(rule)}
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={() => setDeleteId(rule.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/crop-configs')}
                        className="rounded-xl font-bold gap-1 text-slate-600"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Configs
                    </Button>
                    <span className="text-xs text-slate-400 font-semibold">
                        {rules.length} total {rules.length === 1 ? 'activity' : 'activities'} across all stages
                    </span>
                </div>
            </div>

            {/* ── Delete dialog ─────────────────────────────────────────────────── */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl max-w-md">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <AlertDialogTitle className="text-xl font-extrabold text-slate-800">Delete Activity?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium text-sm">
                            This action cannot be undone. Farmers will no longer receive this activity reminder.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold text-slate-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete} disabled={isDeleting}
                            className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Activity'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Add/Edit modal ────────────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                    {editingRule ? '✏️ Edit Activity' : '➕ Add Activity'}
                                    <span className={cn(
                                        "text-sm font-bold px-3 py-1 rounded-full border",
                                        STAGE_BADGE_COLORS[activeStage]
                                    )}>
                                        {currentStage?.icon} {currentStage?.label}
                                    </span>
                                </h2>
                                <Button
                                    variant="ghost" size="icon"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl text-slate-400 hover:text-slate-700"
                                >
                                    <XCircle className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-5">
                            {/* Title EN */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-sm text-slate-700">
                                    Title (English) <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g., Apply Urea Fertilizer"
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Title NP */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-sm text-slate-700">Title (नेपाली)</Label>
                                <Input
                                    value={form.title_np}
                                    onChange={e => setForm(f => ({ ...f, title_np: e.target.value }))}
                                    placeholder="e.g., युरिया मल प्रयोग गर्नुहोस्"
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Description EN */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-sm text-slate-700">
                                    Description (English) <span className="text-rose-500">*</span>
                                </Label>
                                <Textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Detailed description of the activity..."
                                    rows={3}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Description NP */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-sm text-slate-700">Description (नेपाली)</Label>
                                <Textarea
                                    value={form.description_np}
                                    onChange={e => setForm(f => ({ ...f, description_np: e.target.value }))}
                                    placeholder="नेपालीमा विवरण..."
                                    rows={2}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Measurements & Target Pest */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-sm text-slate-700">⚖️ Measurements / Dose</Label>
                                    <Input
                                        value={form.measurements}
                                        onChange={e => setForm(f => ({ ...f, measurements: e.target.value }))}
                                        placeholder="e.g., Urea: 4.8 Kg/Ropani"
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-sm text-slate-700">🐛 Target Pest / Disease</Label>
                                    <Input
                                        value={form.target_pest}
                                        onChange={e => setForm(f => ({ ...f, target_pest: e.target.value }))}
                                        placeholder="e.g., Blast, Aphids"
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="space-y-1.5">
                                <Label className="font-bold text-sm text-slate-700">💡 Recommendations / Tips</Label>
                                <Textarea
                                    value={form.recommendations}
                                    onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                                    placeholder="Additional tips for farmers..."
                                    rows={2}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Day offset, order, active */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-sm text-slate-700">
                                        <Clock className="w-3.5 h-3.5 inline mr-1" />Day Offset
                                    </Label>
                                    <Input
                                        type="number" min={0}
                                        value={form.day_offset}
                                        onChange={e => setForm(f => ({ ...f, day_offset: parseInt(e.target.value) || 0 }))}
                                        className="rounded-xl"
                                    />
                                    <p className="text-[10px] text-slate-400 font-semibold">
                                        {form.day_offset === 0 ? 'Triggers any day in this stage' : `Triggers at day +${form.day_offset}`}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-sm text-slate-700">Display Order</Label>
                                    <Input
                                        type="number" min={0}
                                        value={form.order}
                                        onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="flex flex-col justify-between p-3 bg-slate-50 rounded-xl">
                                    <Label className="font-bold text-sm text-slate-700">Active</Label>
                                    <Switch
                                        checked={form.is_active}
                                        onCheckedChange={checked => setForm(f => ({ ...f, is_active: checked }))}
                                        className="data-[state=checked]:bg-emerald-600 mt-2"
                                    />
                                </div>
                            </div>

                            {/* Modal actions */}
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl font-bold text-slate-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave} disabled={saving}
                                    className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-lg shadow-emerald-100"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving...' : editingRule ? 'Update Activity' : 'Add Activity'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
};

export default CropActivityRules;