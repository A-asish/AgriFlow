import { Droplets, Plus, Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
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
export function FertilizerTab({ crop, onRefresh, isReadOnly = false, canAdd = true }) {
    const { t } = useLanguage();
    const [fertilizers, setFertilizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        fertilizer_type: 'chemical',
        quantity: '',
        unit: 'kg',
        cost: '',
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const formatCurrency = (value) => {
        if (!value || value === 0)
            return 'Rs. 0';
        return `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
    };
    const fetchFertilizers = async () => {
        if (!crop?.id)
            return;
        setLoading(true);
        try {
            const response = await cropsService.listFertilizers(crop.id);
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
            setFertilizers(sortedData);
        }
        catch (error) {
            console.error('Error fetching fertilizers:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchFertilizers();
    }, [crop?.id]);
    const validateName = (name) => {
        if (!name || name.trim() === '')
            return t('crops.fertilizerName') + ' ' + t('common.isRequired');
        if (name.length < 2)
            return 'Name must be at least 2 characters';
        if (name.length > 100)
            return 'Name must be less than 100 characters';
        return '';
    };
    const validateCost = (cost) => {
        if (!cost)
            return t('finance.Amount') + ' ' + t('common.isRequired');
        const numCost = parseFloat(cost);
        if (isNaN(numCost))
            return 'Please enter a valid number';
        if (numCost <= 0)
            return 'Cost must be greater than 0';
        if (numCost > 1000000)
            return 'Cost must be less than 1,000,000';
        return '';
    };
    const validateQuantity = (quantity) => {
        if (!quantity)
            return '';
        const numQuantity = parseFloat(quantity);
        if (isNaN(numQuantity))
            return 'Please enter a valid number';
        if (numQuantity < 0)
            return 'Quantity cannot be negative';
        if (numQuantity > 100000)
            return 'Quantity must be less than 100,000';
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
        if (field === 'cost') {
            const error = validateCost(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, cost: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.cost; return n; });
        }
        if (field === 'quantity') {
            const error = validateQuantity(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, quantity: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.quantity; return n; });
        }
    };
    const validateForm = () => {
        const errors = {};
        const nameError = validateName(form.name);
        if (nameError)
            errors.name = nameError;
        const costError = validateCost(form.cost);
        if (costError)
            errors.cost = costError;
        const quantityError = validateQuantity(form.quantity);
        if (quantityError)
            errors.quantity = quantityError;
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
            name: form.name.trim(),
            fertilizer_type: form.fertilizer_type,
            quantity: form.quantity ? parseFloat(form.quantity) : 0,
            unit: form.unit,
            cost: parseFloat(form.cost),
            application_date: new Date().toISOString().split('T')[0],
            notes: form.notes
        };
        try {
            if (editing?.id) {
                await cropsService.updateFertilizer(editing.id, data);
                toast.success(t('common.success'));
            }
            else {
                await cropsService.addFertilizer(crop.id, data);
                toast.success(t('common.success'));
            }
            setShowForm(false);
            setEditing(null);
            setForm({ name: '', fertilizer_type: 'chemical', quantity: '', unit: 'kg', cost: '', notes: '' });
            setFieldErrors({});
            await fetchFertilizers();
            onRefresh();
        }
        catch (error) {
            console.error('Error saving fertilizer:', error);
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
            await cropsService.deleteFertilizer(deleteId);
            toast.success(t('common.success'));
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await fetchFertilizers();
            onRefresh();
        }
        catch (error) {
            console.error('Error deleting fertilizer:', error);
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
            fertilizer_type: item.fertilizer_type || 'chemical',
            quantity: item.quantity?.toString() || '',
            unit: item.unit || 'kg',
            cost: item.cost?.toString() || '',
            notes: item.notes || ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const totalFertilizerCost = fertilizers.reduce((sum, item) => {
        let cost = item.cost;
        if (typeof cost === 'string')
            cost = parseFloat(cost);
        if (isNaN(cost))
            cost = 0;
        return sum + cost;
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
          <Droplets className="w-5 h-5 text-green-500"/> {t('crops.fertilizerRecords')}
        </h3>
        {!isReadOnly && canAdd && (<Button size="sm" className="rounded-lg gap-2 bg-green-600 hover:bg-green-700" onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({ name: '', fertilizer_type: 'chemical', quantity: '', unit: 'kg', cost: '', notes: '' });
                setFieldErrors({});
            }}>
            <Plus className="w-4 h-4"/> {t('common.add')}
          </Button>)}
      </div>

      {fertilizers.length > 0 && (<div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-green-700">{t('crops.totalExpenses')}:</span>
            <span className="text-lg font-bold text-green-700">{formatCurrency(totalFertilizerCost)}</span>
          </div>
        </div>)}

      <ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : t('common.add')} maxWidth="md">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('crops.fertilizerName')} *
            </Label>
            <Input value={form.name} onChange={e => handleFieldChange('name', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.name ? 'border-red-500' : ''}`} placeholder="e.g., Urea, DAP, Compost"/>
            {fieldErrors.name && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.name}
              </p>)}
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Type
            </Label>
            <Select value={form.fertilizer_type} onValueChange={(v) => setForm(prev => ({ ...prev, fertilizer_type: v }))}>
              <SelectTrigger className="rounded-xl h-11 sm:h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chemical">Chemical</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="bio">Bio-fertilizer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('crops.quantity')}
              </Label>
              <Input type="number" step="0.01" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.quantity ? 'border-red-500' : ''}`} value={form.quantity} onChange={e => handleFieldChange('quantity', e.target.value)} placeholder="0.00"/>
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
                  <SelectItem value="liter">Liter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('finance.Amount')} (Rs.) *
            </Label>
            <Input type="number" step="1" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.cost ? 'border-red-500' : ''}`} value={form.cost} onChange={e => handleFieldChange('cost', e.target.value)} placeholder="Enter total cost"/>
            {fieldErrors.cost && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.cost}
              </p>)}
          </div>
          
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
          <p className="text-sm text-gray-500 mb-6">{t('common.deleteConfirmation') || 'Are you sure you want to delete this record? This action cannot be undone.'}</p>
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

      {fertilizers.length === 0 ? (<p className="text-center py-10 text-muted-foreground">{t('crops.noFertilizerRecords')}</p>) : (<div className="space-y-3">
          {fertilizers.map((item) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-xl gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Droplets className="w-5 h-5 text-green-500 shrink-0 mt-0.5"/>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold wrap-break-word">{item.name}</p>
                  <p className="text-xs text-muted-foreground wrap-break-word">
                    {item.application_date ? new Date(item.application_date).toLocaleDateString() : t('common.noData')}
                    {item.quantity > 0 && ` • ${item.quantity} ${item.unit}`}
                  </p>
                  {item.notes && <p className="text-xs text-muted-foreground mt-1 wrap-break-word">{item.notes}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                <span className="font-bold text-destructive whitespace-nowrap">{formatCurrency(item.cost)}</span>
                {!isReadOnly && canAdd && (<div className="flex gap-1">
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
