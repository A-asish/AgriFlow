import { Syringe, Plus, Edit2, Trash2, AlertTriangle, AlertCircle, User, DollarSign } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { livestockService } from '@/features/farmer/livestock/services/livestock.api';
import { toast } from 'sonner';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
export function VaccinationTab({ animal, onRefresh, isReadOnly = false }) {
    const { t } = useLanguage();
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        vaccine_name: '',
        vaccine_date: new Date().toISOString().split('T')[0],
        next_due_date: '',
        administered_by: '',
        cost: '',
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const formatCurrency = (value) => {
        if (!value || value === 0)
            return `${t('common.rs')} 0`;
        return `${t('common.rs')} ${Math.round(value).toLocaleString('en-IN')}`;
    };
    const fetchVaccinations = async () => {
        if (!animal?.id)
            return;
        setLoading(true);
        try {
            const response = await livestockService.listVaccinations(animal.id);
            let data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            // Sort by: 
            // 1. vaccine_date (newest first)
            // 2. created_at (newest first) - for records with same date
            // 3. id (newest first) - fallback
            data = data.sort((a, b) => {
                // First compare by vaccine_date
                const dateA = new Date(a.vaccine_date).getTime();
                const dateB = new Date(b.vaccine_date).getTime();
                if (dateA !== dateB) {
                    return dateB - dateA; // Descending - newer dates first
                }
                // If same date, compare by created_at
                const createdAtA = new Date(a.created_at).getTime();
                const createdAtB = new Date(b.created_at).getTime();
                if (createdAtA !== createdAtB) {
                    return createdAtB - createdAtA; // Newer created_at first
                }
                // Fallback to id comparison
                return b.id.localeCompare(a.id);
            });
            console.log('Sorted vaccinations:', data.map((v) => ({
                name: v.vaccine_name,
                date: v.vaccine_date,
                created_at: v.created_at
            })));
            setVaccinations(data);
        }
        catch (error) {
            console.error('Error fetching vaccinations:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchVaccinations();
    }, [animal?.id]);
    const refreshAndSort = async () => {
        await fetchVaccinations();
        if (onRefresh)
            onRefresh();
    };
    const validateVaccineName = (name) => {
        if (!name || name.trim() === '')
            return `${t('livestock.vaccineName')} ${t('common.isRequired')}`;
        if (name.length < 2)
            return 'Vaccine name must be at least 2 characters';
        if (name.length > 255)
            return 'Vaccine name must be less than 255 characters';
        return '';
    };
    const validateCost = (cost) => {
        if (!cost)
            return '';
        const numCost = parseFloat(cost);
        if (isNaN(numCost))
            return 'Please enter a valid number';
        if (numCost < 0)
            return 'Cost cannot be negative';
        if (numCost > 1000000)
            return 'Cost must be less than 1,000,000';
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
        if (field === 'vaccine_name') {
            const error = validateVaccineName(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, vaccine_name: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.vaccine_name; return n; });
        }
        if (field === 'cost') {
            const error = validateCost(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, cost: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.cost; return n; });
        }
    };
    const validateForm = () => {
        const errors = {};
        const vaccineNameError = validateVaccineName(form.vaccine_name);
        if (vaccineNameError)
            errors.vaccine_name = vaccineNameError;
        const costError = validateCost(form.cost);
        if (costError)
            errors.cost = costError;
        if (!form.vaccine_date) {
            errors.vaccine_date = `${t('livestock.vaccineDate')} ${t('common.isRequired')}`;
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
            vaccine_name: form.vaccine_name.trim(),
            vaccine_date: form.vaccine_date,
            next_due_date: form.next_due_date || null,
            administered_by: form.administered_by || "",
            cost: form.cost ? parseFloat(form.cost) : 0,
            notes: form.notes || ""
        };
        try {
            if (editing?.id) {
                await livestockService.updateVaccination(editing.id, data);
                toast.success('Vaccination record updated successfully');
            }
            else {
                await livestockService.addVaccination(animal.id, data);
                toast.success('Vaccination record added successfully');
            }
            setShowForm(false);
            setEditing(null);
            setForm({
                vaccine_name: '',
                vaccine_date: new Date().toISOString().split('T')[0],
                next_due_date: '',
                administered_by: '',
                cost: '',
                notes: ''
            });
            setFieldErrors({});
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error saving vaccination:', error);
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
                toast.error('Failed to save vaccination record');
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
            await livestockService.deleteVaccination(deleteId);
            toast.success('Vaccination record deleted successfully');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error deleting vaccination:', error);
            toast.error(error.response?.data?.message || 'Failed to delete vaccination record');
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
            vaccine_name: item.vaccine_name || '',
            vaccine_date: item.vaccine_date || new Date().toISOString().split('T')[0],
            next_due_date: item.next_due_date || '',
            administered_by: item.administered_by || '',
            cost: item.cost?.toString() || '',
            notes: item.notes || ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const totalVaccinationCost = vaccinations.reduce((sum, item) => {
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"/>
        </div>
      </div>);
    }
    return (<div className="farm-card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Syringe className="w-5 h-5 text-green-500 shrink-0"/> {t('livestock.vaccinationRecords')}
        </h3>
        {!isReadOnly && (<Button size="sm" className="rounded-lg gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({
                    vaccine_name: '',
                    vaccine_date: new Date().toISOString().split('T')[0],
                    next_due_date: '',
                    administered_by: '',
                    cost: '',
                    notes: ''
                });
                setFieldErrors({});
            }}>
            <Plus className="w-4 h-4"/> {t('livestock.addVaccination')}
          </Button>)}
      </div>

      {vaccinations.length > 0 && (<div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-green-700">{t('crops.totalExpenses')}:</span>
            <span className="text-lg font-bold text-green-700">{formatCurrency(totalVaccinationCost)}</span>
          </div>
        </div>)}

      {/* Form Dialog */}
      <ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : t('livestock.addVaccination')} maxWidth="md">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('livestock.vaccineName')} *
            </Label>
            <Input value={form.vaccine_name} onChange={e => handleFieldChange('vaccine_name', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.vaccine_name ? 'border-red-500' : ''}`} placeholder="e.g., FMD Vaccine, Rabies Vaccine"/>
            {fieldErrors.vaccine_name && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.vaccine_name}
              </p>)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('livestock.vaccineDate')} *
              </Label>
              <Input type="date" value={form.vaccine_date} onChange={e => setForm(prev => ({ ...prev, vaccine_date: e.target.value }))} className="rounded-xl h-11 sm:h-12"/>
              {fieldErrors.vaccine_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.vaccine_date}
                </p>)}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Next Due Date
              </Label>
              <Input type="date" value={form.next_due_date} onChange={e => setForm(prev => ({ ...prev, next_due_date: e.target.value }))} className="rounded-xl h-11 sm:h-12"/>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Administered By
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input value={form.administered_by} onChange={e => setForm(prev => ({ ...prev, administered_by: e.target.value }))} className="rounded-xl h-11 sm:h-12 pl-10" placeholder="Veterinarian name"/>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('finance.Amount')} ({t('common.rs')})
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <Input type="number" step="1" className={`rounded-xl h-11 sm:h-12 pl-10 ${fieldErrors.cost ? 'border-red-500' : ''}`} value={form.cost} onChange={e => handleFieldChange('cost', e.target.value)} placeholder="Enter cost"/>
              </div>
              {fieldErrors.cost && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.cost}
                </p>)}
            </div>
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

      {vaccinations.length === 0 ? (<p className="text-center py-10 text-muted-foreground">{t('livestock.noVaccinationRecords')}</p>) : (<div className="space-y-3">
          {vaccinations.map((item, index) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 bg-muted/30">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Syringe className="w-5 h-5 text-green-500 shrink-0 mt-0.5"/>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.vaccine_name}</p>
                    <span className="text-xs text-muted-foreground">{new Date(item.vaccine_date).toLocaleDateString()}</span>
                    {index === 0 && (<span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Latest
                      </span>)}
                  </div>
                  {item.administered_by && <p className="text-xs text-muted-foreground">By: {item.administered_by}</p>}
                  {item.next_due_date && (<p className="text-xs text-amber-600">Next due: {new Date(item.next_due_date).toLocaleDateString()}</p>)}
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                <span className="font-bold text-green-600 whitespace-nowrap">{formatCurrency(item.cost)}</span>
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
