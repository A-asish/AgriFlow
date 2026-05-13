import { HeartPulse, Plus, Edit2, Trash2, AlertTriangle, AlertCircle, Stethoscope, Syringe, Bandage } from 'lucide-react';
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
export function HealthTab({ animal, onRefresh, isReadOnly = false }) {
    const { t } = useLanguage();
    const [healthRecords, setHealthRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        health_type: 'checkup',
        diagnosis: '',
        treatment: '',
        treatment_date: new Date().toISOString().split('T')[0],
        follow_up_date: '',
        vet_name: '',
        cost: '',
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const formatCurrency = (value) => {
        if (!value || value === 0)
            return `${t('common.rs')} 0`;
        return `${t('common.rs')} ${Math.round(value).toLocaleString('en-IN')}`;
    };
    const fetchHealthRecords = async () => {
        if (!animal?.id)
            return;
        setLoading(true);
        try {
            const response = await livestockService.listHealthRecords(animal.id);
            let data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
            // Sort by treatment_date - newest first, then by created_at
            data = data.sort((a, b) => {
                const dateA = new Date(a.treatment_date).getTime();
                const dateB = new Date(b.treatment_date).getTime();
                if (dateA !== dateB) {
                    return dateB - dateA;
                }
                const createdAtA = new Date(a.created_at).getTime();
                const createdAtB = new Date(b.created_at).getTime();
                return createdAtB - createdAtA;
            });
            setHealthRecords(data);
        }
        catch (error) {
            console.error('Error fetching health records:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchHealthRecords();
    }, [animal?.id]);
    const refreshAndSort = async () => {
        await fetchHealthRecords();
        if (onRefresh)
            onRefresh();
    };
    const validateDiagnosis = (diagnosis) => {
        if (!diagnosis || diagnosis.trim() === '')
            return `${t('livestock.diagnosis')} ${t('common.isRequired')}`;
        if (diagnosis.length < 2)
            return 'Diagnosis must be at least 2 characters';
        if (diagnosis.length > 255)
            return 'Diagnosis must be less than 255 characters';
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
        if (field === 'diagnosis') {
            const error = validateDiagnosis(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, diagnosis: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.diagnosis; return n; });
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
        const diagnosisError = validateDiagnosis(form.diagnosis);
        if (diagnosisError)
            errors.diagnosis = diagnosisError;
        const costError = validateCost(form.cost);
        if (costError)
            errors.cost = costError;
        if (!form.treatment_date) {
            errors.treatment_date = `${t('livestock.treatmentDate')} ${t('common.isRequired')}`;
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
            health_type: form.health_type,
            diagnosis: form.diagnosis.trim(),
            treatment: form.treatment || "",
            treatment_date: form.treatment_date,
            follow_up_date: form.follow_up_date || null,
            vet_name: form.vet_name || "",
            cost: form.cost ? parseFloat(form.cost) : 0,
            notes: form.notes || ""
        };
        try {
            if (editing?.id) {
                await livestockService.updateHealthRecord(editing.id, data);
                toast.success('Health record updated successfully');
            }
            else {
                await livestockService.addHealthRecord(animal.id, data);
                toast.success('Health record added successfully');
            }
            setShowForm(false);
            setEditing(null);
            setForm({
                health_type: 'checkup',
                diagnosis: '',
                treatment: '',
                treatment_date: new Date().toISOString().split('T')[0],
                follow_up_date: '',
                vet_name: '',
                cost: '',
                notes: ''
            });
            setFieldErrors({});
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error saving health record:', error);
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
                toast.error('Failed to save health record');
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
            await livestockService.deleteHealthRecord(deleteId);
            toast.success('Health record deleted successfully');
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await refreshAndSort();
        }
        catch (error) {
            console.error('Error deleting health record:', error);
            toast.error(error.response?.data?.message || 'Failed to delete health record');
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
            health_type: item.health_type || 'checkup',
            diagnosis: item.diagnosis || '',
            treatment: item.treatment || '',
            treatment_date: item.treatment_date || new Date().toISOString().split('T')[0],
            follow_up_date: item.follow_up_date || '',
            vet_name: item.vet_name || '',
            cost: item.cost?.toString() || '',
            notes: item.notes || ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const getHealthTypeIcon = (type) => {
        switch (type) {
            case 'checkup': return <Stethoscope className="w-4 h-4 text-blue-500"/>;
            case 'sick': return <HeartPulse className="w-4 h-4 text-red-500"/>;
            case 'injury': return <Bandage className="w-4 h-4 text-orange-500"/>;
            case 'treatment': return <Syringe className="w-4 h-4 text-green-500"/>;
            default: return <Syringe className="w-4 h-4 text-gray-500"/>;
        }
    };
    const getHealthTypeLabel = (type) => {
        switch (type) {
            case 'checkup': return 'Regular Checkup';
            case 'sick': return 'Sickness';
            case 'injury': return 'Injury';
            case 'treatment': return 'Treatment';
            case 'other': return 'Other';
            default: return type;
        }
    };
    const totalHealthCost = healthRecords.reduce((sum, item) => {
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
          <HeartPulse className="w-5 h-5 text-rose-500"/> {t('livestock.healthRecords')}
        </h3>
        {!isReadOnly && (<Button size="sm" className="rounded-lg gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => {
                setShowForm(true);
                setEditing(null);
                setForm({
                    health_type: 'checkup',
                    diagnosis: '',
                    treatment: '',
                    treatment_date: new Date().toISOString().split('T')[0],
                    follow_up_date: '',
                    vet_name: '',
                    cost: '',
                    notes: ''
                });
                setFieldErrors({});
            }}>
            <Plus className="w-4 h-4"/> {t('livestock.addHealthRecord')}
          </Button>)}
      </div>

      {healthRecords.length > 0 && (<div className="mb-4 p-3 bg-rose-50 rounded-lg border border-rose-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-rose-700">{t('crops.totalExpenses')}:</span>
            <span className="text-lg font-bold text-rose-700">{formatCurrency(totalHealthCost)}</span>
          </div>
        </div>)}

      <ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : t('livestock.addHealthRecord')} maxWidth="md">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Health Type *
            </Label>
            <Select value={form.health_type} onValueChange={(v) => setForm(prev => ({ ...prev, health_type: v }))}>
              <SelectTrigger className="rounded-xl h-11 sm:h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkup">🏥 Regular Checkup</SelectItem>
                <SelectItem value="sick">🤒 Sickness</SelectItem>
                <SelectItem value="injury">🩸 Injury</SelectItem>
                <SelectItem value="treatment">💊 Treatment</SelectItem>
                <SelectItem value="other">📋 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Diagnosis *
            </Label>
            <Input value={form.diagnosis} onChange={e => handleFieldChange('diagnosis', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.diagnosis ? 'border-red-500' : ''}`} placeholder="e.g., Fever, Injury, Infection"/>
            {fieldErrors.diagnosis && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.diagnosis}
              </p>)}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Treatment
            </Label>
            <Textarea className="rounded-xl resize-none" rows={2} value={form.treatment} onChange={e => setForm(prev => ({ ...prev, treatment: e.target.value }))} placeholder="Describe the treatment given..."/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Treatment Date *
              </Label>
              <Input type="date" value={form.treatment_date} onChange={e => setForm(prev => ({ ...prev, treatment_date: e.target.value }))} className="rounded-xl h-11 sm:h-12"/>
              {fieldErrors.treatment_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.treatment_date}
                </p>)}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Follow-up Date
              </Label>
              <Input type="date" value={form.follow_up_date} onChange={e => setForm(prev => ({ ...prev, follow_up_date: e.target.value }))} className="rounded-xl h-11 sm:h-12"/>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Vet Name
              </Label>
              <Input value={form.vet_name} onChange={e => setForm(prev => ({ ...prev, vet_name: e.target.value }))} className="rounded-xl h-11 sm:h-12" placeholder="Veterinarian name"/>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('finance.Amount')} ({t('common.rs')}) *
              </Label>
              <Input type="number" step="1" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.cost ? 'border-red-500' : ''}`} value={form.cost} onChange={e => handleFieldChange('cost', e.target.value)} placeholder="Enter cost"/>
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

      {healthRecords.length === 0 ? (<p className="text-center py-10 text-muted-foreground">{t('livestock.noHealthRecords')}</p>) : (<div className="space-y-3">
          {healthRecords.map((item, index) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 bg-muted/30">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="shrink-0">{getHealthTypeIcon(item.health_type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{getHealthTypeLabel(item.health_type)}</p>
                    <span className="text-xs text-muted-foreground">{new Date(item.treatment_date).toLocaleDateString()}</span>
                    {index === 0 && (<span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        Latest
                      </span>)}
                  </div>
                  <p className="text-sm font-medium mt-1">Diagnosis: {item.diagnosis}</p>
                  {item.treatment && <p className="text-xs text-muted-foreground mt-1">Treatment: {item.treatment}</p>}
                  {item.vet_name && <p className="text-xs text-muted-foreground">Vet: {item.vet_name}</p>}
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                  {item.follow_up_date && (<p className="text-xs text-amber-600 mt-1">Follow-up: {new Date(item.follow_up_date).toLocaleDateString()}</p>)}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                <span className="font-bold text-rose-600 whitespace-nowrap">{formatCurrency(item.cost)}</span>
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
