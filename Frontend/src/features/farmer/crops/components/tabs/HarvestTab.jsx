import { Sprout, Plus, Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { toast } from 'sonner';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
export function HarvestTab({ crop, onRefresh, isReadOnly = false, canAdd = true }) {
    const { t } = useLanguage();
    const [harvests, setHarvests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        quantity: '',
        unit: 'kg',
        quality: 'standard',
        harvest_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const formatCurrency = (value) => {
        if (!value || value === 0)
            return 'Rs. 0';
        return `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
    };
    const formatDateForDisplay = (dateString) => {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    const fetchHarvests = async () => {
        if (!crop?.id)
            return;
        setLoading(true);
        try {
            const response = await cropsService.listHarvests(crop.id);
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
            setHarvests(sortedData);
        }
        catch (error) {
            console.error('Error fetching harvests:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchHarvests();
    }, [crop?.id]);
    const validateQuantity = (quantity) => {
        if (!quantity || quantity.trim() === '')
            return t('crops.quantity') + ' ' + t('common.isRequired');
        const numQuantity = parseFloat(quantity);
        if (isNaN(numQuantity))
            return 'Please enter a valid number';
        if (numQuantity <= 0)
            return 'Quantity must be greater than 0';
        if (numQuantity > 100000)
            return 'Quantity must be less than 100000';
        return '';
    };
    const validateHarvestDate = (date) => {
        if (!date)
            return t('finance.Date') + ' ' + t('common.isRequired');
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > today)
            return 'Harvest date cannot be in the future';
        if (selectedDate.getFullYear() < 2000)
            return 'Please enter a valid year';
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
        if (field === 'quantity') {
            const error = validateQuantity(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, quantity: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.quantity; return n; });
        }
        if (field === 'harvest_date') {
            const error = validateHarvestDate(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, harvest_date: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.harvest_date; return n; });
        }
    };
    const validateForm = () => {
        const errors = {};
        const quantityError = validateQuantity(form.quantity);
        if (quantityError)
            errors.quantity = quantityError;
        const dateError = validateHarvestDate(form.harvest_date);
        if (dateError)
            errors.harvest_date = dateError;
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error(t('common.error'));
            return;
        }
        setIsSubmitting(true);
        const data = {
            harvest_date: form.harvest_date,
            quantity: parseFloat(form.quantity),
            unit: form.unit,
            quality: form.quality,
            notes: form.notes
        };
        try {
            if (editing?.id) {
                await cropsService.updateHarvest(editing.id, data);
                toast.success(t('common.success'));
            }
            else {
                await cropsService.addHarvest(crop.id, data);
                toast.success(t('common.success'));
            }
            setShowForm(false);
            setEditing(null);
            setForm({
                quantity: '',
                unit: 'kg',
                quality: 'standard',
                harvest_date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setFieldErrors({});
            await fetchHarvests();
            onRefresh();
        }
        catch (error) {
            console.error('Error saving harvest:', error);
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
            await cropsService.deleteHarvest(deleteId);
            toast.success(t('common.success'));
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await fetchHarvests();
            onRefresh();
        }
        catch (error) {
            console.error('Error deleting harvest:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const startEdit = (item) => {
        if (isReadOnly || !canAdd)
            return; // Check permissions
        setEditing(item);
        setForm({
            quantity: item.quantity?.toString() || '',
            unit: item.unit || 'kg',
            quality: item.quality || 'standard',
            harvest_date: item.harvest_date || new Date().toISOString().split('T')[0],
            notes: item.notes || ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const totalHarvest = harvests.reduce((sum, item) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity);
        return sum + (isNaN(quantity) ? 0 : quantity);
    }, 0);
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
          <Sprout className="w-5 h-5 text-emerald-500"/> {t('crops.harvestRecords')}
        </h3>
        {/* Only show Add button if not readOnly and canAdd */}
        {!isReadOnly && canAdd && (<Button size="sm" className="rounded-lg gap-2 bg-green-600 hover:bg-green-700" onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({
                    quantity: '',
                    unit: 'kg',
                    quality: 'standard',
                    harvest_date: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                setFieldErrors({});
            }}>
            <Plus className="w-4 h-4"/> {t('crops.recordHarvest')}
          </Button>)}
      </div>

      {harvests.length > 0 && (<div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-emerald-700">{t('crops.totalHarvest')}:</span>
            <span className="text-lg font-bold text-emerald-700">
              {totalHarvest.toLocaleString()} {harvests[0]?.unit || 'kg'}
            </span>
          </div>
        </div>)}

      {/* Only show form dialog if not readOnly and canAdd */}
      {!isReadOnly && canAdd && (<ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : t('crops.recordHarvest')} maxWidth="md">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('finance.Date')} *
              </Label>
              <Input type="date" value={form.harvest_date} onChange={e => handleFieldChange('harvest_date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.harvest_date ? 'border-red-500' : ''}`} max={new Date().toISOString().split('T')[0]}/>
              {fieldErrors.harvest_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.harvest_date}
                </p>)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.quantity')} *
                </Label>
                <Input type="number" step="0.01" value={form.quantity} onChange={e => handleFieldChange('quantity', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.quantity ? 'border-red-500' : ''}`} placeholder="0.00"/>
                {fieldErrors.quantity && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.quantity}
                  </p>)}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.unit')}
                </Label>
                <Select value={form.unit} onValueChange={(v) => setForm(prev => ({ ...prev, unit: v }))}>
                  <SelectTrigger className="rounded-xl h-11 sm:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="quintal">Quintal</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('crops.quality')}
              </Label>
              <Select value={form.quality} onValueChange={(v) => setForm(prev => ({ ...prev, quality: v }))}>
                <SelectTrigger className="rounded-xl h-11 sm:h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">{t('crops.premium')}</SelectItem>
                  <SelectItem value="standard">{t('crops.standard')}</SelectItem>
                  <SelectItem value="low">{t('crops.fair')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('common.notes')}
              </Label>
              <Textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder={t('common.notesPlaceholder')} className="rounded-xl min-h-24 resize-none"/>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleSubmit} disabled={isSubmitting || Object.keys(fieldErrors).length > 0} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700">
                {isSubmitting ? t('common.saving') : (editing ? t('common.edit') : t('crops.recordHarvest'))}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} className="w-full sm:flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </ResponsiveDialog>)}

      <ResponsiveDialog isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteId(null); }} title={t('common.delete')} maxWidth="sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600"/>
          </div>
          <p className="text-sm text-gray-500 mb-6">{t('common.deleteConfirmation') || 'Are you sure you want to delete this harvest record? This action cannot be undone.'}</p>
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

      {harvests.length === 0 ? (<p className="text-center py-10 text-muted-foreground">{t('crops.noHarvestRecords')}</p>) : (<div className="space-y-3">
          {harvests.map((item) => {
                const quantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity);
                return (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-xl gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Sprout className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"/>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold wrap-break-word">
                      {(isNaN(quantity) ? 0 : quantity).toLocaleString()} {item.unit}
                    </p>
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {item.harvest_date ? formatDateForDisplay(item.harvest_date) : t('common.noData')}
                      {item.quality && ` • ${t('crops.quality')}: ${item.quality}`}
                    </p>
                    {item.notes && <p className="text-xs text-muted-foreground mt-1 wrap-break-word">{item.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <div className="flex gap-1">
                    {/* Only show Edit/Delete buttons if not readOnly and canAdd */}
                    {!isReadOnly && canAdd && (<>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item)}>
                          <Edit2 className="w-3 h-3"/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(item.id); setShowDeleteConfirm(true); }}>
                          <Trash2 className="w-3 h-3"/>
                        </Button>
                      </>)}
                  </div>
                </div>
              </div>);
            })}
        </div>)}
    </div>);
}
