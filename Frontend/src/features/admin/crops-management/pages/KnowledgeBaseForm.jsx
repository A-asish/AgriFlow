import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BookOpen, ArrowLeft, Save, Sparkles, Sprout, Info, Thermometer, Droplet, Layers, Beaker } from 'lucide-react';
import adminService from '../../services/admin.api';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'cereal', label: 'Cereal' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'cash_crop', label: 'Cash Crop' },
    { value: 'vegetable', label: 'Vegetable' },
];

const SEASONS = [
    { value: 'spring', label: 'Spring' },
    { value: 'monsoon', label: 'Monsoon' },
    { value: 'autumn', label: 'Autumn' },
    { value: 'winter', label: 'Winter' },
];

const WATER_REQS = [
    { value: 'low', label: 'Low (Drought-resistant / rainfed)' },
    { value: 'medium', label: 'Medium (Moderate watering)' },
    { value: 'high', label: 'High (Frequent irrigation / paddy)' },
];

const TOLERANCE_LEVELS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const FROST_CHOICES = [
    { value: 'yes', label: 'Yes (Frost kills it)' },
    { value: 'no', label: 'No (Frost tolerant)' },
    { value: 'tolerant', label: 'Tolerant (Survives light frost)' },
];

const STORAGE_CHOICES = [
    { value: 'very_short', label: 'Very Short (< 1 Week)' },
    { value: 'short', label: 'Short (1-4 Weeks)' },
    { value: 'medium', label: 'Medium (1-3 Months)' },
    { value: 'long', label: 'Long (> 3 Months)' },
];

const REGIONS = [
    { value: 'terai', label: 'Terai' },
    { value: 'mid-hill', label: 'Mid-Hill' },
    { value: 'hill', label: 'Hill' },
    { value: 'mountain', label: 'Mountain' },
];

const INITIAL_STATE = {
    name_en: '',
    name_np: '',
    category: 'cereal',
    best_season: 'spring',
    other_seasons: '',
    temp_min: '',
    temp_max: '',
    temp_ideal: '',
    soil_ideal: '',
    soil_other: '',
    ph_min: '',
    ph_max: '',
    ph_ideal: '',
    water_req: 'medium',
    region_suitable: '',
    drought_tolerance: 'medium',
    frost_sensitive: 'no',
    labor_req: 'medium',
    storage_life: 'medium',
    n_need: 60,
    p_need: 40,
    k_need: 40
};

const KnowledgeBaseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [errors, setErrors] = useState({});

    // Load data if editing
    useEffect(() => {
        if (isEdit) {
            const fetchEntry = async () => {
                try {
                    const res = await adminService.getKnowledgeBaseDetail(id);
                    const data = res.data;
                    setForm({
                        ...data,
                        temp_min: data.temp_min ?? '',
                        temp_max: data.temp_max ?? '',
                        temp_ideal: data.temp_ideal ?? '',
                        ph_min: data.ph_min ?? '',
                        ph_max: data.ph_max ?? '',
                        ph_ideal: data.ph_ideal ?? '',
                        n_need: data.n_need ?? 60,
                        p_need: data.p_need ?? 40,
                        k_need: data.k_need ?? 40,
                    });
                    
                    if (data.region_suitable) {
                        const parsed = data.region_suitable.split(',').map(r => r.trim().toLowerCase());
                        setSelectedRegions(parsed);
                    }
                } catch (err) {
                    toast.error("Failed to load crop profile details");
                    navigate('/admin/knowledge-base');
                } finally {
                    setFetching(false);
                }
            };
            fetchEntry();
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleRegionToggle = (region) => {
        let updated;
        if (selectedRegions.includes(region)) {
            updated = selectedRegions.filter(r => r !== region);
        } else {
            updated = [...selectedRegions, region];
        }
        setSelectedRegions(updated);
        setForm(prev => ({
            ...prev,
            region_suitable: updated.join(', ')
        }));
        if (errors.region_suitable) {
            setErrors(prev => ({ ...prev, region_suitable: null }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.name_en?.trim()) errs.name_en = "English name is required";
        if (!form.soil_ideal?.trim()) errs.soil_ideal = "Ideal soil description is required";
        if (selectedRegions.length === 0) errs.region_suitable = "Please select at least one suitable region";

        const tempMin = parseFloat(form.temp_min);
        const tempMax = parseFloat(form.temp_max);
        const tempIdeal = parseFloat(form.temp_ideal);

        if (isNaN(tempMin)) errs.temp_min = "Min temperature is required";
        if (isNaN(tempMax)) errs.temp_max = "Max temperature is required";
        if (isNaN(tempIdeal)) errs.temp_ideal = "Ideal temperature is required";

        if (!isNaN(tempMin) && !isNaN(tempMax) && tempMin > tempMax) {
            errs.temp_min = "Min temperature cannot be greater than max temperature";
        }
        if (!isNaN(tempMin) && !isNaN(tempMax) && !isNaN(tempIdeal)) {
            if (tempIdeal < tempMin || tempIdeal > tempMax) {
                errs.temp_ideal = "Ideal temperature must be between min and max";
            }
        }

        const phMin = parseFloat(form.ph_min);
        const phMax = parseFloat(form.ph_max);
        const phIdeal = parseFloat(form.ph_ideal);

        if (isNaN(phMin)) errs.ph_min = "Min pH is required";
        if (isNaN(phMax)) errs.ph_max = "Max pH is required";
        if (isNaN(phIdeal)) errs.ph_ideal = "Ideal pH is required";

        if (!isNaN(phMin) && (phMin < 0 || phMin > 14)) errs.ph_min = "pH must be between 0 and 14";
        if (!isNaN(phMax) && (phMax < 0 || phMax > 14)) errs.ph_max = "pH must be between 0 and 14";
        if (!isNaN(phIdeal) && (phIdeal < 0 || phIdeal > 14)) errs.ph_ideal = "pH must be between 0 and 14";

        if (!isNaN(phMin) && !isNaN(phMax) && phMin > phMax) {
            errs.ph_min = "Min pH cannot be greater than max pH";
        }
        if (!isNaN(phMin) && !isNaN(phMax) && !isNaN(phIdeal)) {
            if (phIdeal < phMin || phIdeal > phMax) {
                errs.ph_ideal = "Ideal pH must be between min and max pH";
            }
        }

        const nNeed = parseFloat(form.n_need);
        const pNeed = parseFloat(form.p_need);
        const kNeed = parseFloat(form.k_need);

        if (isNaN(nNeed) || nNeed < 0) errs.n_need = "N requirement must be a positive number";
        if (isNaN(pNeed) || pNeed < 0) errs.p_need = "P requirement must be a positive number";
        if (isNaN(kNeed) || kNeed < 0) errs.k_need = "K requirement must be a positive number";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please resolve validation errors first");
            return;
        }

        // Parse numbers
        const payload = {
            ...form,
            temp_min: parseFloat(form.temp_min),
            temp_max: parseFloat(form.temp_max),
            temp_ideal: parseFloat(form.temp_ideal),
            ph_min: parseFloat(form.ph_min),
            ph_max: parseFloat(form.ph_max),
            ph_ideal: parseFloat(form.ph_ideal),
            n_need: parseFloat(form.n_need),
            p_need: parseFloat(form.p_need),
            k_need: parseFloat(form.k_need),
        };

        setLoading(true);
        try {
            if (isEdit) {
                await adminService.updateKnowledgeBase(id, payload);
                toast.success("Crop profile updated successfully");
            } else {
                await adminService.createKnowledgeBase(payload);
                toast.success("Crop profile created successfully");
            }
            navigate('/admin/knowledge-base');
        } catch (err) {
            console.error(err);
            if (err.response?.data) {
                const apiErrs = err.response.data;
                // Map apiErrors if they match our fields
                const newErrs = {};
                Object.keys(apiErrs).forEach(key => {
                    newErrs[key] = Array.isArray(apiErrs[key]) ? apiErrs[key].join(', ') : apiErrs[key];
                });
                setErrors(newErrs);
            }
            toast.error(err.response?.data?.error || "An error occurred while saving the profile.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"/>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <button 
                            onClick={() => navigate('/admin/knowledge-base')}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider mb-2"
                        >
                            <ArrowLeft className="w-4 h-4"/> Back to Knowledge Base
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Sprout className="w-5 h-5"/>
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                                {isEdit ? `Edit Crop Profile: ${form.name_en}` : 'Create Crop Profile'}
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            {isEdit ? 'Update environmental thresholds and nutrients for this crop.' : 'Add new crop recommendations parameters to the platform.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Part 1: Basic Information */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-emerald-600" />
                                <CardTitle className="text-base font-bold text-slate-800">Basic Information</CardTitle>
                            </div>
                            <CardDescription>Enter primary nomenclature and categories of the crop profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="name_en" className="font-bold text-slate-700">Crop Name (English) <span className="text-rose-500">*</span></Label>
                                <Input 
                                    id="name_en" 
                                    name="name_en" 
                                    value={form.name_en} 
                                    onChange={handleChange}
                                    placeholder="e.g., Rice, Wheat, Tomato"
                                    className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.name_en && "border-rose-400 focus:ring-rose-500")}
                                />
                                {errors.name_en && <p className="text-xs font-bold text-rose-500">{errors.name_en}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name_np" className="font-bold text-slate-700">Crop Name (Nepali)</Label>
                                <Input 
                                    id="name_np" 
                                    name="name_np" 
                                    value={form.name_np} 
                                    onChange={handleChange}
                                    placeholder="e.g., धान, गहुँ, गोलभेडा"
                                    className="rounded-xl border-slate-200 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="font-bold text-slate-700">Category <span className="text-rose-500">*</span></Label>
                                <select 
                                    id="category" 
                                    name="category"
                                    value={form.category} 
                                    onChange={(e) => handleSelectChange('category', e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                >
                                    {CATEGORIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="best_season" className="font-bold text-slate-700">Best Cultivation Season <span className="text-rose-500">*</span></Label>
                                <select 
                                    id="best_season" 
                                    name="best_season"
                                    value={form.best_season} 
                                    onChange={(e) => handleSelectChange('best_season', e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                >
                                    {SEASONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="other_seasons" className="font-bold text-slate-700">Other Suitable Seasons</Label>
                                <Input 
                                    id="other_seasons" 
                                    name="other_seasons" 
                                    value={form.other_seasons} 
                                    onChange={handleChange}
                                    placeholder="e.g., summer, winter (comma-separated list)"
                                    className="rounded-xl border-slate-200 focus:ring-emerald-500"
                                />
                                <p className="text-[11px] text-slate-400 font-semibold">Separate with commas: spring, summer, monsoon, autumn, winter</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Part 2: Environmental Thresholds */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-emerald-600" />
                                <CardTitle className="text-base font-bold text-slate-800">Climatic & Soil Requirements</CardTitle>
                            </div>
                            <CardDescription>Define target ranges for temperature, pH, and soil type.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Temp Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="temp_min" className="font-bold text-slate-700">Min Temp (°C) <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        id="temp_min" 
                                        name="temp_min" 
                                        type="number"
                                        step="0.1"
                                        value={form.temp_min} 
                                        onChange={handleChange}
                                        placeholder="e.g., 10"
                                        className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.temp_min && "border-rose-400 focus:ring-rose-500")}
                                    />
                                    {errors.temp_min && <p className="text-xs font-bold text-rose-500">{errors.temp_min}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="temp_max" className="font-bold text-slate-700">Max Temp (°C) <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        id="temp_max" 
                                        name="temp_max" 
                                        type="number"
                                        step="0.1"
                                        value={form.temp_max} 
                                        onChange={handleChange}
                                        placeholder="e.g., 35"
                                        className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.temp_max && "border-rose-400 focus:ring-rose-500")}
                                    />
                                    {errors.temp_max && <p className="text-xs font-bold text-rose-500">{errors.temp_max}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="temp_ideal" className="font-bold text-slate-700">Ideal Temp (°C) <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        id="temp_ideal" 
                                        name="temp_ideal" 
                                        type="number"
                                        step="0.1"
                                        value={form.temp_ideal} 
                                        onChange={handleChange}
                                        placeholder="e.g., 24"
                                        className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.temp_ideal && "border-rose-400 focus:ring-rose-500")}
                                    />
                                    {errors.temp_ideal && <p className="text-xs font-bold text-rose-500">{errors.temp_ideal}</p>}
                                </div>
                            </div>

                            {/* pH Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="ph_min" className="font-bold text-slate-700">Min pH <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        id="ph_min" 
                                        name="ph_min" 
                                        type="number"
                                        step="0.1"
                                        value={form.ph_min} 
                                        onChange={handleChange}
                                        placeholder="e.g., 5.5"
                                        className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.ph_min && "border-rose-400 focus:ring-rose-500")}
                                    />
                                    {errors.ph_min && <p className="text-xs font-bold text-rose-500">{errors.ph_min}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ph_max" className="font-bold text-slate-700">Max pH <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        id="ph_max" 
                                        name="ph_max" 
                                        type="number"
                                        step="0.1"
                                        value={form.ph_max} 
                                        onChange={handleChange}
                                        placeholder="e.g., 7.5"
                                        className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.ph_max && "border-rose-400 focus:ring-rose-500")}
                                    />
                                    {errors.ph_max && <p className="text-xs font-bold text-rose-500">{errors.ph_max}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ph_ideal" className="font-bold text-slate-700">Ideal pH <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        id="ph_ideal" 
                                        name="ph_ideal" 
                                        type="number"
                                        step="0.1"
                                        value={form.ph_ideal} 
                                        onChange={handleChange}
                                        placeholder="e.g., 6.5"
                                        className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.ph_ideal && "border-rose-400 focus:ring-rose-500")}
                                    />
                                    {errors.ph_ideal && <p className="text-xs font-bold text-rose-500">{errors.ph_ideal}</p>}
                                </div>
                            </div>

                            {/* Soil Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="soil_ideal" className="font-bold text-slate-700">Ideal Soil <span className="text-rose-500">*</span></Label>
                                    <Input 
                                        id="soil_ideal" 
                                        name="soil_ideal" 
                                        value={form.soil_ideal} 
                                        onChange={handleChange}
                                        placeholder="e.g., Loamy, Sandy Loam"
                                        className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.soil_ideal && "border-rose-400 focus:ring-rose-500")}
                                    />
                                    {errors.soil_ideal && <p className="text-xs font-bold text-rose-500">{errors.soil_ideal}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="soil_other" className="font-bold text-slate-700">Other Suitable Soil Types</Label>
                                    <Input 
                                        id="soil_other" 
                                        name="soil_other" 
                                        value={form.soil_other} 
                                        onChange={handleChange}
                                        placeholder="e.g., clay, silty (comma-separated list)"
                                        className="rounded-xl border-slate-200 focus:ring-emerald-500"
                                    />
                                    <p className="text-[11px] text-slate-400 font-semibold">Separate with commas: clay, silty loam, sandy, peat</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Part 3: Cultivation & Tolerances */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Droplet className="w-5 h-5 text-emerald-600" />
                                <CardTitle className="text-base font-bold text-slate-800">Water, Regions & Tolerances</CardTitle>
                            </div>
                            <CardDescription>Determine operational demands and geographical suitability.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="water_req" className="font-bold text-slate-700">Water Requirement <span className="text-rose-500">*</span></Label>
                                    <select 
                                        id="water_req" 
                                        name="water_req"
                                        value={form.water_req} 
                                        onChange={(e) => handleSelectChange('water_req', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                    >
                                        {WATER_REQS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="drought_tolerance" className="font-bold text-slate-700">Drought Tolerance <span className="text-rose-500">*</span></Label>
                                    <select 
                                        id="drought_tolerance" 
                                        name="drought_tolerance"
                                        value={form.drought_tolerance} 
                                        onChange={(e) => handleSelectChange('drought_tolerance', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                    >
                                        {TOLERANCE_LEVELS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="frost_sensitive" className="font-bold text-slate-700">Frost Sensitivity <span className="text-rose-500">*</span></Label>
                                    <select 
                                        id="frost_sensitive" 
                                        name="frost_sensitive"
                                        value={form.frost_sensitive} 
                                        onChange={(e) => handleSelectChange('frost_sensitive', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                    >
                                        {FROST_CHOICES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="labor_req" className="font-bold text-slate-700">Labor Requirement <span className="text-rose-500">*</span></Label>
                                    <select 
                                        id="labor_req" 
                                        name="labor_req"
                                        value={form.labor_req} 
                                        onChange={(e) => handleSelectChange('labor_req', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                    >
                                        {TOLERANCE_LEVELS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="storage_life" className="font-bold text-slate-700">Storage/Shelf Life <span className="text-rose-500">*</span></Label>
                                    <select 
                                        id="storage_life" 
                                        name="storage_life"
                                        value={form.storage_life} 
                                        onChange={(e) => handleSelectChange('storage_life', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                    >
                                        {STORAGE_CHOICES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Suitable Regions Checklist */}
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Suitable Geographical Regions <span className="text-rose-500">*</span></Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {REGIONS.map((region) => {
                                        const isSelected = selectedRegions.includes(region.value);
                                        return (
                                            <button
                                                key={region.value}
                                                type="button"
                                                onClick={() => handleRegionToggle(region.value)}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2",
                                                    isSelected 
                                                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                                                        : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                                )}
                                            >
                                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                                {region.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.region_suitable && <p className="text-xs font-bold text-rose-500">{errors.region_suitable}</p>}
                                <p className="text-[11px] text-slate-400 font-semibold mt-1">This configures which region match recommendations. E.g., Paddy matches Terai region primarily.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Part 4: NPK Requirements */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-emerald-600" />
                                <CardTitle className="text-base font-bold text-slate-800">Nutrient Requirements (NPK)</CardTitle>
                            </div>
                            <CardDescription>Configure Nitrogen, Phosphorus, and Potassium requirements per hectare.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="n_need" className="font-bold text-slate-700">Nitrogen Requirement (kg/ha) <span className="text-rose-500">*</span></Label>
                                <Input 
                                    id="n_need" 
                                    name="n_need" 
                                    type="number"
                                    value={form.n_need} 
                                    onChange={handleChange}
                                    placeholder="e.g., 60"
                                    className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.n_need && "border-rose-400 focus:ring-rose-500")}
                                />
                                {errors.n_need && <p className="text-xs font-bold text-rose-500">{errors.n_need}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="p_need" className="font-bold text-slate-700">Phosphorus Requirement (kg/ha) <span className="text-rose-500">*</span></Label>
                                <Input 
                                    id="p_need" 
                                    name="p_need" 
                                    type="number"
                                    value={form.p_need} 
                                    onChange={handleChange}
                                    placeholder="e.g., 40"
                                    className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.p_need && "border-rose-400 focus:ring-rose-500")}
                                />
                                {errors.p_need && <p className="text-xs font-bold text-rose-500">{errors.p_need}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="k_need" className="font-bold text-slate-700">Potassium Requirement (kg/ha) <span className="text-rose-500">*</span></Label>
                                <Input 
                                    id="k_need" 
                                    name="k_need" 
                                    type="number"
                                    value={form.k_need} 
                                    onChange={handleChange}
                                    placeholder="e.g., 40"
                                    className={cn("rounded-xl border-slate-200 focus:ring-emerald-500", errors.k_need && "border-rose-400 focus:ring-rose-500")}
                                />
                                {errors.k_need && <p className="text-xs font-bold text-rose-500">{errors.k_need}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => navigate('/admin/knowledge-base')}
                            className="rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 px-6 py-2.5 transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <Save className="w-4 h-4"/> {loading ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default KnowledgeBaseForm;
