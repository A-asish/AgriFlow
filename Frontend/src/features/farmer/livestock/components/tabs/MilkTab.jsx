import { Milk, Plus, Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { livestockService } from '@/features/farmer/livestock/services/livestock.api';
import { toast } from 'sonner';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
export function MilkTab({ animal, onRefresh, isReadOnly = false }) {
    const { t } = useLanguage();
    const [milkRecords, setMilkRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        quantity_liters: '',
        milk_time: 'total',
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const fetchMilkRecords = async () => {
        if (!animal?.id)
            return;
        setLoading(true);
        try {
            const response = await livestockService.listMilkRecords(animal.id);
            let data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            // Sort by date - newest first, then by created_at for same dates
            data = data.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (dateA !== dateB) {
                    return dateB - dateA;
                }
                const createdAtA = new Date(a.created_at).getTime();
                const createdAtB = new Date(b.created_at).getTime();
                return createdAtB - createdAtA;
            });
            setMilkRecords(data);
        }
        catch (error) {
            console.error('Error fetching milk records:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchMilkRecords();
    }, [animal?.id]);
    const refreshAndSort = async () => {
        await fetchMilkRecords();
        if (onRefresh)
            onRefresh();
    };
    const validateQuantity = (quantity) => {
        if (!quantity)
            return `${t('livestock.quantity')} ${t('common.isRequired')}`;
        const numQuantity = parseFloat(quantity);
        if (isNaN(numQuantity))
            return 'Please enter a valid number';
        if (numQuantity <= 0)
            return 'Quantity must be greater than 0';
        if (numQuantity > 100)
            return 'Quantity must be less than 100 liters';
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
        if (field === 'quantity_liters') {
            const error = validateQuantity(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, quantity_liters: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.quantity_liters; return n; });
        }
    };
    const validateForm = () => {
        const errors = {};
        const quantityError = validateQuantity(form.quantity_liters);
        if (quantityError)
            errors.quantity_liters = quantityError;
        if (!form.date) {
            errors.date = `${t('common.date')} ${t('common.isRequired')}`;
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        setIsSubmitting(true);
        const data = {
            animal: animal.id,
            date: form.date,
            quantity_liters: parseFloat(form.quantity_liters),
            milk_time: form.milk_time,
            notes: form.notes || ""
        };
        try {
            if (editing?.id) {
                await livestockService.updateMilkRecord(editing.id, data);
                toast.success('Milk record updated successfully');
            }
            else {
                await livestockService.addMilkRecord(animal.id, data);
                toast.success('Milk record added successfully');
            }
            setShowForm(false);
            setEditing(null);
            setForm({
                date: new Date().toISOString().split('T')[0],
                quantity_liters: '',
                milk_time: 'total',
                notes: ''
            });
            setFieldErrors({});
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error saving milk record:', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    toast.error(errorMessages);
                }
                else {
                    toast.error(errorData);
                }
            }
            else {
                toast.error('Failed to save milk record');
            }
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
            await livestockService.deleteMilkRecord(deleteId);
            toast.success('Milk record deleted successfully');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error deleting milk record:', error);
            toast.error(error.response?.data?.message || 'Failed to delete milk record');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const startEdit = (item) => {
        if (isReadOnly)
            return;
        setEditing(item);
        setForm({
            date: item.date || new Date().toISOString().split('T')[0],
            quantity_liters: item.quantity_liters?.toString() || '',
            milk_time: item.milk_time || 'total',
            notes: item.notes || ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const getMilkTimeLabel = (time) => {
        switch (time) {
            case 'morning': return 'Morning';
            case 'evening': return 'Evening';
            default: return 'Total Day';
        }
    };
    const totalMilk = milkRecords.reduce((sum, item) => {
        let quantity = item.quantity_liters;
        if (typeof quantity === 'string')
            quantity = parseFloat(quantity);
        if (isNaN(quantity))
            quantity = 0;
        return sum + quantity;
    }, 0);
    if (loading) {
        return (<div className="farm-card">
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"/>
        </div>
      </div>);
    }
    return (<div className="farm-card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Milk className="w-5 h-5 text-blue-500 shrink-0"/> {t('livestock.milkRecords')}
        </h3>
        {!isReadOnly && (<Button size="sm" className="rounded-lg gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({
                    date: new Date().toISOString().split('T')[0],
                    quantity_liters: '',
                    milk_time: 'total',
                    notes: ''
                });
                setFieldErrors({});
            }}>
            <Plus className="w-4 h-4"/> {t('livestock.addMilkRecord')}
          </Button>)}
      </div>

      {milkRecords.length > 0 && (<div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-blue-700">{t('livestock.totalMilk')}:</span>
            <span className="text-lg font-bold text-blue-700">{totalMilk.toFixed(2)} {t('livestock.liters')}</span>
          </div>
        </div>)}

      <ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : t('livestock.addMilkRecord')} maxWidth="md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('common.date')} *
              </Label>
              <Input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.date ? 'border-red-500' : ''}`}/>
              {fieldErrors.date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.date}
                </p>)}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Milk Time
              </Label>
              <Select value={form.milk_time} onValueChange={(v) => setForm(prev => ({ ...prev, milk_time: v }))}>
                <SelectTrigger className="rounded-xl h-11 sm:h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="total">Total Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Quantity ({t('livestock.liters')}) *
            </Label>
            <Input type="number" step="0.1" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.quantity_liters ? 'border-red-500' : ''}`} value={form.quantity_liters} onChange={e => handleFieldChange('quantity_liters', e.target.value)} placeholder="Enter quantity in liters"/>
            {fieldErrors.quantity_liters && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.quantity_liters}
              </p>)}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.notes')}
            </Label>
            <Textarea className="rounded-xl resize-none" rows={2} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder={t('common.notesPlaceholder')}/>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting || Object.keys(fieldErrors).length > 0} className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700">
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
          <p className="text-sm text-gray-500 mb-6">{t('common.deleteConfirmation')}</p>
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

      {milkRecords.length === 0 ? (<p className="text-center py-10 text-muted-foreground">{t('livestock.noMilkRecords')}</p>) : (<div className="space-y-3">
          {milkRecords.map((item, index) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 bg-muted/30">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Milk className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"/>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.quantity_liters} {t('livestock.liters')}</p>
                    <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                    {index === 0 && (<span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Latest
                      </span>)}
                  </div>
                  <p className="text-xs text-muted-foreground">Time: {getMilkTimeLabel(item.milk_time)}</p>
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                {!isReadOnly && (<div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item)}>
                      <Edit2 className="w-3 h-3"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(item.id); setShowDeleteConfirm(true); }}>
                      <Trash2 className="w-3 h-3"/>
                    </Button>
                  </div>)}
              </div>
            </div>))}
        </div>)}
    </div>);
}
