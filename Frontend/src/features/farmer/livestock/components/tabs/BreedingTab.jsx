import { Baby, Plus, Edit2, Trash2, AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
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
export function BreedingTab({ animal, onRefresh, isReadOnly = false }) {
    const { t } = useLanguage();
    const [breedingRecords, setBreedingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        breeding_date: new Date().toISOString().split('T')[0],
        successful: 'false',
        expected_birth_date: '',
        actual_birth_date: '',
        offspring_count: '',
        sire_animal: '',
        sire_name: '',
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const fetchBreedingRecords = async () => {
        if (!animal?.id)
            return;
        setLoading(true);
        try {
            const response = await livestockService.listBreedingRecords(animal.id);
            let data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            // Sort by breeding_date - newest first, then by created_at
            data = data.sort((a, b) => {
                const dateA = new Date(a.breeding_date).getTime();
                const dateB = new Date(b.breeding_date).getTime();
                if (dateA !== dateB) {
                    return dateB - dateA;
                }
                const createdAtA = new Date(a.created_at).getTime();
                const createdAtB = new Date(b.created_at).getTime();
                return createdAtB - createdAtA;
            });
            setBreedingRecords(data);
        }
        catch (error) {
            console.error('Error fetching breeding records:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBreedingRecords();
    }, [animal?.id]);
    const refreshAndSort = async () => {
        await fetchBreedingRecords();
        if (onRefresh)
            onRefresh();
    };
    const clearFieldError = (field) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };
    const validateBreedingDate = (date) => {
        if (!date)
            return `${t('livestock.breedingDate')} ${t('common.isRequired')}`;
        return '';
    };
    const validateOffspringCount = (count) => {
        if (!count)
            return '';
        const numCount = parseInt(count);
        if (isNaN(numCount))
            return t('livestock.offspringCountValid') || 'Please enter a valid number';
        if (numCount < 0)
            return t('livestock.offspringCountNegative') || 'Offspring count cannot be negative';
        if (numCount > 20)
            return t('livestock.offspringCountMax') || 'Offspring count is too high (max 20)';
        return '';
    };
    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        clearFieldError(field);
        if (field === 'breeding_date') {
            const error = validateBreedingDate(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, breeding_date: error }));
        }
        if (field === 'offspring_count') {
            const error = validateOffspringCount(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, offspring_count: error }));
        }
    };
    const validateForm = () => {
        const errors = {};
        const breedingDateError = validateBreedingDate(form.breeding_date);
        if (breedingDateError)
            errors.breeding_date = breedingDateError;
        if (form.successful === 'true' && form.actual_birth_date && !form.offspring_count) {
            errors.offspring_count = t('livestock.offspringCountRequired') || 'Offspring count is required when birth date is recorded';
        }
        const offspringCountError = validateOffspringCount(form.offspring_count);
        if (offspringCountError)
            errors.offspring_count = offspringCountError;
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error(t('common.error'));
            return;
        }
        setIsSubmitting(true);
        const isSuccessful = form.successful === 'true';
        const data = {
            animal: animal.id,
            breeding_date: form.breeding_date,
            successful: isSuccessful,
            expected_birth_date: form.expected_birth_date || null,
            actual_birth_date: form.actual_birth_date || null,
            offspring_count: parseInt(form.offspring_count) || 0,
            sire_animal: form.sire_animal || null,
            sire_name: form.sire_name || "",
            notes: form.notes || ""
        };
        try {
            if (editing?.id) {
                await livestockService.updateBreedingRecord(editing.id, data);
                toast.success(t('livestock.breedingRecordUpdated'));
            }
            else {
                await livestockService.addBreedingRecord(animal.id, data);
                toast.success(t('livestock.breedingRecordAdded'));
            }
            setShowForm(false);
            setEditing(null);
            setForm({
                breeding_date: new Date().toISOString().split('T')[0],
                successful: 'false',
                expected_birth_date: '',
                actual_birth_date: '',
                offspring_count: '',
                sire_animal: '',
                sire_name: '',
                notes: ''
            });
            setFieldErrors({});
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error saving breeding record:', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    if (errorData.non_field_errors) {
                        const errorMessage = errorData.non_field_errors[0];
                        toast.error(errorMessage);
                    }
                    else {
                        const errorMessages = Object.entries(errorData)
                            .map(([key, value]) => {
                            const errorMsg = Array.isArray(value) ? value[0] : value;
                            return errorMsg;
                        })
                            .join(', ');
                        toast.error(errorMessages);
                    }
                }
                else {
                    toast.error(errorData);
                }
            }
            else {
                toast.error(t('livestock.breedingRecordError'));
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
            await livestockService.deleteBreedingRecord(deleteId);
            toast.success(t('livestock.breedingRecordDeleted'));
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error deleting breeding record:', error);
            toast.error(error.response?.data?.message || t('livestock.breedingRecordDeleteError'));
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
            breeding_date: item.breeding_date || new Date().toISOString().split('T')[0],
            successful: item.successful ? 'true' : 'false',
            expected_birth_date: item.expected_birth_date || '',
            actual_birth_date: item.actual_birth_date || '',
            offspring_count: item.offspring_count?.toString() || '',
            sire_animal: item.sire_animal || '',
            sire_name: item.sire_name || '',
            notes: item.notes || ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    if (loading) {
        return (<div className="farm-card">
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"/>
        </div>
      </div>);
    }
    const hasFormErrors = Object.keys(fieldErrors).length > 0;
    return (<div className="farm-card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Baby className="w-5 h-5 text-pink-500 shrink-0"/> {t('livestock.breedingRecords')}
        </h3>
        {!isReadOnly && (<Button size="sm" className="rounded-lg gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({
                    breeding_date: new Date().toISOString().split('T')[0],
                    successful: 'false',
                    expected_birth_date: '',
                    actual_birth_date: '',
                    offspring_count: '',
                    sire_animal: '',
                    sire_name: '',
                    notes: ''
                });
                setFieldErrors({});
            }}>
            <Plus className="w-4 h-4"/> {t('livestock.addBreedingRecord')}
          </Button>)}
      </div>

      <ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : t('livestock.addBreedingRecord')} maxWidth="md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('livestock.breedingDate')} *
              </Label>
              <Input type="date" value={form.breeding_date} onChange={e => handleFieldChange('breeding_date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.breeding_date ? 'border-red-500' : ''}`}/>
              {fieldErrors.breeding_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.breeding_date}
                </p>)}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('livestock.successful')}
              </Label>
              <Select value={form.successful} onValueChange={(v) => {
            setForm(prev => ({ ...prev, successful: v }));
            clearFieldError('offspring_count');
        }}>
                <SelectTrigger className="rounded-xl h-11 sm:h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t('common.yes')}</SelectItem>
                  <SelectItem value="false">{t('common.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.successful === 'true' && (<>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t('livestock.expectedBirthDate')}
                  </Label>
                  <Input type="date" value={form.expected_birth_date} onChange={e => setForm(prev => ({ ...prev, expected_birth_date: e.target.value }))} className="rounded-xl h-11 sm:h-12"/>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t('livestock.actualBirthDate')}
                  </Label>
                  <Input type="date" value={form.actual_birth_date} onChange={e => {
                setForm(prev => ({ ...prev, actual_birth_date: e.target.value }));
                if (!e.target.value) {
                    clearFieldError('offspring_count');
                }
            }} className="rounded-xl h-11 sm:h-12"/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t('livestock.offspringCount')} {form.actual_birth_date && <span className="text-red-500">*</span>}
                  </Label>
                  <Input type="number" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.offspring_count ? 'border-red-500' : ''}`} value={form.offspring_count} onChange={e => handleFieldChange('offspring_count', e.target.value)} placeholder={t('livestock.offspringCountPlaceholder')}/>
                  {fieldErrors.offspring_count && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3"/> {fieldErrors.offspring_count}
                    </p>)}
                  {form.actual_birth_date && !form.offspring_count && (<p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3"/> {t('livestock.offspringCountRequired')}
                    </p>)}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t('livestock.sireAnimalId')}
                  </Label>
                  <Input value={form.sire_animal} onChange={e => setForm(prev => ({ ...prev, sire_animal: e.target.value }))} className="rounded-xl h-11 sm:h-12" placeholder={t('livestock.sireAnimalIdPlaceholder')}/>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('livestock.sireName')}
                </Label>
                <Input value={form.sire_name} onChange={e => setForm(prev => ({ ...prev, sire_name: e.target.value }))} className="rounded-xl h-11 sm:h-12" placeholder={t('livestock.sireNamePlaceholder')}/>
                <p className="text-xs text-muted-foreground">{t('livestock.sireNameHint')}</p>
              </div>
            </>)}

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.notes')}
            </Label>
            <Textarea className="rounded-xl resize-none" rows={2} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder={t('common.notesPlaceholder')}/>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting || hasFormErrors} className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700">
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

      {breedingRecords.length === 0 ? (<p className="text-center py-10 text-muted-foreground">{t('livestock.noBreedingRecords')}</p>) : (<div className="space-y-3">
          {breedingRecords.map((item, index) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 bg-muted/30">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {item.successful ?
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5"/> :
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/>}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{t('livestock.bredOn')} {new Date(item.breeding_date).toLocaleDateString()}</p>
                    <span className="text-xs text-muted-foreground">
                      {item.successful ? `✓ ${t('livestock.successful')}` : `✗ ${t('livestock.notSuccessful')}`}
                    </span>
                    {index === 0 && (<span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Latest
                      </span>)}
                  </div>
                  {item.successful && (<>
                      {item.expected_birth_date && (<p className="text-xs text-muted-foreground">{t('livestock.expected')}: {new Date(item.expected_birth_date).toLocaleDateString()}</p>)}
                      {item.actual_birth_date && (<p className="text-xs text-green-600">{t('livestock.born')}: {new Date(item.actual_birth_date).toLocaleDateString()}</p>)}
                      {item.offspring_count > 0 && (<p className="text-xs text-muted-foreground">{t('livestock.offspring')}: {item.offspring_count}</p>)}
                      {(item.sire_animal || item.sire_name) && (<p className="text-xs text-muted-foreground">{t('livestock.sire')}: {item.sire_name || item.sire_animal?.tag_number}</p>)}
                    </>)}
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                </div>
              </div>
              {!isReadOnly && (<div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item)}>
                    <Edit2 className="w-3 h-3"/>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(item.id); setShowDeleteConfirm(true); }}>
                    <Trash2 className="w-3 h-3"/>
                  </Button>
                </div>)}
            </div>))}
        </div>)}
    </div>);
}
