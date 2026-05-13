import { Users, Plus, Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { toast } from 'sonner';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
export function LaborTab({ crop, onRefresh, isReadOnly = false, canAdd = true }) {
    const { t } = useLanguage();
    const [labor, setLabor] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        workers_count: '',
        days: '',
        rate_per_day: '',
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const formatCurrency = (value) => {
        if (!value || value === 0)
            return 'Rs. 0';
        return `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
    };
    const fetchLabor = async () => {
        if (!crop?.id)
            return;
        setLoading(true);
        try {
            const response = await cropsService.listLabor(crop.id);
            const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            const sortedData = [...data].sort((a, b) => {
                const dateA = new Date(a.application_date).getTime();
                const dateB = new Date(b.application_date).getTime();
                if (dateA === dateB) {
                    // If dates are equal, sort by created_at (most recent first)
                    const createdAtA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const createdAtB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return createdAtB - createdAtA;
                }
                return dateB - dateA;
            });
            setLabor(sortedData);
        }
        catch (error) {
            console.error('Error fetching Labors:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchLabor();
    }, [crop?.id]);
    const validateName = (name) => {
        if (!name || name.trim() === '')
            return t('crops.description') + ' ' + t('common.isRequired');
        if (name.length < 2)
            return t('crops.description') + ' must be at least 2 characters';
        if (name.length > 255)
            return t('crops.description') + ' must be less than 255 characters';
        return '';
    };
    const validateWorkersCount = (count) => {
        if (!count)
            return t('common.workers') + ' ' + t('common.isRequired');
        const numCount = parseInt(count);
        if (isNaN(numCount))
            return 'Please enter a valid number';
        if (numCount <= 0)
            return t('common.workers') + ' must be greater than 0';
        if (numCount > 1000)
            return t('common.workers') + ' must be less than 1000';
        return '';
    };
    const validateDays = (days) => {
        if (!days)
            return t('common.days') + ' ' + t('common.isRequired');
        const numDays = parseFloat(days);
        if (isNaN(numDays))
            return 'Please enter a valid number';
        if (numDays <= 0)
            return t('common.days') + ' must be greater than 0';
        if (numDays > 365)
            return t('common.days') + ' must be less than 365';
        return '';
    };
    const validateRatePerDay = (rate) => {
        if (!rate)
            return 'Rate per day' + ' ' + t('common.isRequired');
        const numRate = parseFloat(rate);
        if (isNaN(numRate))
            return 'Please enter a valid number';
        if (numRate <= 0)
            return 'Rate per day must be greater than 0';
        if (numRate > 10000)
            return 'Rate per day must be less than 10,000';
        return '';
    };
    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const n = { ...prev };
                delete n[field];
                return n;
            });
        }
        if (field === 'name') {
            const error = validateName(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, name: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.name; return n; });
        }
        if (field === 'workers_count') {
            const error = validateWorkersCount(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, workers_count: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.workers_count; return n; });
        }
        if (field === 'days') {
            const error = validateDays(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, days: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.days; return n; });
        }
        if (field === 'rate_per_day') {
            const error = validateRatePerDay(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, rate_per_day: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.rate_per_day; return n; });
        }
    };
    const validateForm = () => {
        const errors = {};
        const nameError = validateName(form.name);
        if (nameError)
            errors.name = nameError;
        const workersError = validateWorkersCount(form.workers_count);
        if (workersError)
            errors.workers_count = workersError;
        const daysError = validateDays(form.days);
        if (daysError)
            errors.days = daysError;
        const rateError = validateRatePerDay(form.rate_per_day);
        if (rateError)
            errors.rate_per_day = rateError;
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error(t('common.error'));
            return;
        }
        setIsSubmitting(true);
        const workersCount = parseInt(form.workers_count);
        const days = parseFloat(form.days);
        const ratePerDay = parseFloat(form.rate_per_day);
        const totalCost = workersCount * days * ratePerDay;
        const data = {
            name: form.name.trim(),
            workers_count: workersCount,
            days: days,
            rate_per_day: ratePerDay,
            total_cost: totalCost,
            date: new Date().toISOString().split('T')[0],
            notes: form.notes || ''
        };
        try {
            if (editing?.id) {
                await cropsService.updateLabor(editing.id, data);
                toast.success(t('common.success'));
            }
            else {
                await cropsService.addLabor(crop.id, data);
                toast.success(t('common.success'));
            }
            setShowForm(false);
            setEditing(null);
            setForm({ name: '', workers_count: '', days: '', rate_per_day: '', notes: '' });
            setFieldErrors({});
            await fetchLabor();
            onRefresh();
        }
        catch (error) {
            console.error('Error saving labor:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        setIsSubmitting(true);
        try {
            await cropsService.deleteLabor(deleteId);
            toast.success(t('common.success'));
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await fetchLabor();
            onRefresh();
        }
        catch (error) {
            console.error('Error deleting labor:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const startEdit = (item) => {
        if (isReadOnly || !canAdd)
            return;
        setEditing(item);
        setForm({
            name: item.name,
            workers_count: item.workers_count?.toString() || '',
            days: item.days?.toString() || '',
            rate_per_day: item.rate_per_day?.toString() || '',
            notes: item.notes || ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const totalCost = labor.reduce((sum, item) => {
        const cost = item.total_cost || (item.workers_count * item.days * item.rate_per_day);
        return sum + (typeof cost === 'number' ? cost : 0);
    }, 0);
    const previewTotal = (() => {
        const workers = parseInt(form.workers_count) || 0;
        const days = parseFloat(form.days) || 0;
        const rate = parseFloat(form.rate_per_day) || 0;
        return workers * days * rate;
    })();
    if (loading) {
        return (<div className="farm-card">
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/>
        </div>
      </div>);
    }
    return (<div className="farm-card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500"/> {t('crops.tabLabor')}
        </h3>
        {!isReadOnly && canAdd && (<Button size="sm" className="rounded-lg gap-2 bg-green-600 hover:bg-green-700" onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({ name: '', workers_count: '', days: '', rate_per_day: '', notes: '' });
                setFieldErrors({});
            }}>
            <Plus className="w-4 h-4"/> {t('common.add')}
          </Button>)}
      </div>

      {totalCost > 0 && (<div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-blue-700">{t('finance.totalExpense')}:</span>
            <span className="text-lg font-bold text-blue-700">{formatCurrency(totalCost)}</span>
          </div>
        </div>)}

      <ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : t('common.add')} maxWidth="md">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('crops.description')} *
            </Label>
            <Input type="text" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.name ? 'border-red-500' : ''}`} value={form.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="e.g., Plowing, Weeding, Harvesting"/>
            {fieldErrors.name && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.name}
              </p>)}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('common.workers')} *
              </Label>
              <Input type="number" step="1" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.workers_count ? 'border-red-500' : ''}`} value={form.workers_count} onChange={e => handleFieldChange('workers_count', e.target.value)} placeholder="Workers"/>
              {fieldErrors.workers_count && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.workers_count}
                </p>)}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('common.days')} *
              </Label>
              <Input type="number" step="0.5" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.days ? 'border-red-500' : ''}`} value={form.days} onChange={e => handleFieldChange('days', e.target.value)} placeholder="Days"/>
              {fieldErrors.days && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.days}
                </p>)}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Rate/Day (Rs.) *
              </Label>
              <Input type="number" step="1" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.rate_per_day ? 'border-red-500' : ''}`} value={form.rate_per_day} onChange={e => handleFieldChange('rate_per_day', e.target.value)} placeholder="Rate/Day"/>
              {fieldErrors.rate_per_day && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.rate_per_day}
                </p>)}
            </div>
          </div>

          {(form.workers_count || form.days || form.rate_per_day) && (<div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">{t('finance.totalExpense')}:</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(previewTotal)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {form.workers_count || 0} {t('common.workers')} × {form.days || 0} {t('common.days')} × Rs.{form.rate_per_day || 0}
              </p>
            </div>)}

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.notes')}
            </Label>
            <Textarea className="rounded-xl resize-none" rows={2} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder={t('common.notesPlaceholder')}/>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting || Object.keys(fieldErrors).length > 0} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700">
              {isSubmitting ? t('common.saving') : (editing ? t('common.edit') : t('common.add'))}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} className="w-full sm:flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteId(null); }} title={t('common.delete')} maxWidth="sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600"/>
          </div>
          <p className="text-sm text-gray-500 mb-6">{t('common.deleteConfirmation') || 'Are you sure you want to delete this labor record? This action cannot be undone.'}</p>
          <div className="flex gap-3">
            <Button onClick={handleDelete} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
              {isSubmitting ? t('common.saving') : t('common.delete')}
            </Button>
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteId(null); }} className="flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {labor.length === 0 ? (<p className="text-center py-10 text-muted-foreground">{t('crops.noLaborRecords') || 'No labor records yet'}</p>) : (<div className="space-y-3">
          {labor.map((item) => {
                const totalCostItem = item.total_cost || (item.workers_count * item.days * item.rate_per_day);
                return (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-xl gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Users className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"/>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold wrap-break-word">{item.name}</p>
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {item.date ? new Date(item.date).toLocaleDateString() : t('common.noData')} • 
                      {item.workers_count} {t('common.workers')} × {item.days} {t('common.days')} × Rs.{item.rate_per_day}
                    </p>
                    {item.notes && <p className="text-xs text-muted-foreground mt-1 wrap-break-word">{item.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span className="font-bold text-destructive whitespace-nowrap">{formatCurrency(totalCostItem)}</span>
                  {!isReadOnly && canAdd && (<div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item)}>
                        <Edit2 className="w-3 h-3"/>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(item.id); setShowDeleteConfirm(true); }}>
                        <Trash2 className="w-3 h-3"/>
                      </Button>
                    </div>)}
                </div>
              </div>);
            })}
        </div>)}
    </div>);
}
