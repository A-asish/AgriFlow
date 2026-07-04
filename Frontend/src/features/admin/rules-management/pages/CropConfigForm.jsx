// src/features/admin/rules-management/pages/CropConfigForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  ArrowLeft, Save, ChevronRight,
  Info, Sliders, Calendar, Loader2, ClipboardList
} from 'lucide-react';
import adminService from '../../services/admin.api';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const REGIONS = [
  { value: 'terai', label: 'Terai' },
  { value: 'hilly', label: 'Hilly' },
  { value: 'himalayan', label: 'Himalayan' },
];

const SEASONS = [
  { value: 'spring', label: 'Spring (Feb-Apr)' },
  { value: 'summer', label: 'Summer (May-Jul)' },
  { value: 'monsoon', label: 'Monsoon (Jun-Sep)' },
  { value: 'autumn', label: 'Autumn (Sep-Nov)' },
  { value: 'winter', label: 'Winter (Dec-Feb)' },
];

const INITIAL_STATE = {
  crop_name: '',
  variety: '',
  region: 'terai',
  season: 'spring',
  is_active: true,
  germination_duration: 10,
  vegetative_duration: 30,
  flowering_duration: 20,
  maturation_duration: 25,
  harvest_duration: 35,
};

const CropConfigForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await adminService.getCropConfigDetail(id);
        const data = res.data;
        setFormData({
          crop_name: data.crop_name || '',
          variety: data.variety || '',
          region: data.region || 'terai',
          season: data.season || 'spring',
          is_active: data.is_active ?? true,
          germination_duration: Math.max(1, data.germination_end_day - data.germination_start_day),
          vegetative_duration: Math.max(1, data.vegetative_end_day - data.vegetative_start_day + 1),
          flowering_duration: Math.max(1, data.flowering_end_day - data.flowering_start_day + 1),
          maturation_duration: Math.max(1, data.maturation_end_day - data.maturation_start_day + 1),
          harvest_duration: Math.max(1, data.harvest_end_day - data.harvest_start_day + 1),
        });
      } catch (err) {
        toast.error("Failed to load crop configuration");
        navigate('/admin/crop-configs');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.crop_name?.trim()) errs.crop_name = "Crop name is required";
    ['germination', 'vegetative', 'flowering', 'maturation', 'harvest'].forEach(stage => {
      const key = `${stage}_duration`;
      const val = parseInt(formData[key]);
      if (isNaN(val) || val <= 0) errs[key] = "Must be greater than 0";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const calculateDayRanges = () => {
    const g = parseInt(formData.germination_duration) || 10;
    const v = parseInt(formData.vegetative_duration) || 30;
    const f = parseInt(formData.flowering_duration) || 20;
    const m = parseInt(formData.maturation_duration) || 25;
    const h = parseInt(formData.harvest_duration) || 35;

    const g_end = g;
    const v_end = g_end + v;
    const f_end = v_end + f;
    const m_end = f_end + m;
    const h_end = m_end + h;

    return {
      germination_start_day: 0,   germination_end_day: g_end,
      vegetative_start_day: g_end + 1,  vegetative_end_day: v_end,
      flowering_start_day: v_end + 1,   flowering_end_day: f_end,
      maturation_start_day: f_end + 1,  maturation_end_day: m_end,
      harvest_start_day: m_end + 1,     harvest_end_day: h_end,
      total_growing_days: h_end,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error("Please fix validation errors"); return; }

    const payload = {
      crop_name: formData.crop_name.trim(),
      variety: formData.variety.trim(),
      region: formData.region,
      season: formData.season,
      is_active: formData.is_active,
      ...calculateDayRanges(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await adminService.updateCropConfig(id, payload);
        toast.success("Crop configuration updated! Now manage its activities.");
        navigate(`/admin/crop-configs/${id}/rules`);
      } else {
        const response = await adminService.createCropConfig(payload);
        const newId = response.data?.id || response.data?.data?.id;
        toast.success("Configuration created! Now add activities for each growth stage.");
        navigate(`/admin/crop-configs/${newId}/rules`);
      }
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object') {
        const newErrs = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          newErrs[key] = Array.isArray(val) ? val.join(', ') : val;
        });
        setErrors(newErrs);
        toast.error(Object.values(newErrs)[0] || "Validation failed");
      } else {
        toast.error("Failed to save configuration");
      }
    } finally {
      setSaving(false);
    }
  };

  const ranges = calculateDayRanges();

  const stages = [
    { key: 'germination', icon: '🌱', label: 'Germination', start: ranges.germination_start_day, end: ranges.germination_end_day },
    { key: 'vegetative',  icon: '🌿', label: 'Vegetative',  start: ranges.vegetative_start_day,  end: ranges.vegetative_end_day },
    { key: 'flowering',   icon: '🌸', label: 'Flowering',   start: ranges.flowering_start_day,   end: ranges.flowering_end_day },
    { key: 'maturation',  icon: '🍎', label: 'Maturation',  start: ranges.maturation_start_day,  end: ranges.maturation_end_day },
    { key: 'harvest',     icon: '✂️', label: 'Harvest',     start: ranges.harvest_start_day,     end: ranges.harvest_end_day },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/admin/crop-configs')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to configurations
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {isEdit ? `Edit: ${formData.crop_name || 'Configuration'}` : 'Create Crop Configuration'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {isEdit
              ? 'Update growth stages, then manage day-wise activities for each stage.'
              : 'Step 1 of 2 — Set up growth stages. You\'ll add day-wise activities next.'}
          </p>
        </div>

        {/* Step indicator (create mode only) */}
        {!isEdit && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">1</span>
              <span className="text-sm font-bold text-emerald-800">Configure Stages</span>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
            <div className="flex items-center gap-2 opacity-50">
              <span className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-700 text-xs font-black flex items-center justify-center">2</span>
              <span className="text-sm font-bold text-emerald-700">Add Activities</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base font-bold text-slate-800">Basic Information</CardTitle>
              </div>
              <CardDescription>Configure basic identity variables for the crop lifecycle.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="crop_name" className="font-bold text-slate-700">
                  Crop Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="crop_name" name="crop_name"
                  value={formData.crop_name} onChange={handleChange}
                  placeholder="e.g., Rice, Tomato, Wheat"
                  className={cn("rounded-xl", errors.crop_name && "border-rose-400 focus:ring-rose-500")}
                />
                {errors.crop_name && <p className="text-xs font-bold text-rose-500">{errors.crop_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety" className="font-bold text-slate-700">Variety</Label>
                <Input
                  id="variety" name="variety"
                  value={formData.variety} onChange={handleChange}
                  placeholder="e.g., Mansuli, Khumal-4 (optional)"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Region <span className="text-rose-500">*</span></Label>
                <select
                  value={formData.region}
                  onChange={(e) => handleSelectChange('region', e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                >
                  {REGIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Growing Season <span className="text-rose-500">*</span></Label>
                <select
                  value={formData.season}
                  onChange={(e) => handleSelectChange('season', e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                >
                  {SEASONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl md:col-span-2">
                <div>
                  <Label className="font-bold text-slate-800 text-sm">Active Status</Label>
                  <p className="text-xs text-slate-400 font-semibold">Enable or disable this lifecycle configuration.</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSelectChange('is_active', checked)}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stage Durations */}
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-base font-bold text-slate-800">Stage Durations</CardTitle>
              </div>
              <CardDescription>Specify the duration (in days) for each growth stage. Day ranges update automatically.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stages.map(({ key, icon, label, start, end }) => {
                  const durationKey = `${key}_duration`;
                  return (
                    <div key={key} className="space-y-2">
                      <Label className="font-bold text-xs text-slate-600">{icon} {label}</Label>
                      <Input
                        name={durationKey}
                        type="number"
                        min={1}
                        value={formData[durationKey]}
                        onChange={handleChange}
                        className={cn("rounded-xl h-11", errors[durationKey] && "border-rose-400")}
                      />
                      <p className="text-[10px] text-emerald-600 font-bold">Day {start} – {end}</p>
                      {errors[durationKey] && (
                        <p className="text-xs font-bold text-rose-500">{errors[durationKey]}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" /> Total Cultivation Cycle:
                </span>
                <span className="text-sm text-emerald-700 font-extrabold">{ranges.total_growing_days} Days</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button" variant="ghost"
              onClick={() => navigate('/admin/crop-configs')}
              className="rounded-xl font-bold text-slate-600 w-full sm:w-auto"
            >
              Cancel
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {isEdit && (
                <Button
                  type="button" variant="outline"
                  onClick={() => navigate(`/admin/crop-configs/${id}/rules`)}
                  className="rounded-xl font-bold gap-2 border-slate-300 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 w-full sm:w-auto"
                >
                  <ClipboardList className="w-4 h-4" /> Manage Activities
                </Button>
              )}

              <Button
                type="submit" disabled={saving}
                className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 px-6 py-2.5 w-full sm:w-auto transition-all duration-200 hover:-translate-y-0.5"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : isEdit ? 'Update & Manage Activities' : 'Create & Add Activities'}
                {!saving && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CropConfigForm;