import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar, CalendarDays, DollarSign, AlertCircle, HeartPulse } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { livestockService } from '../services/livestock.api';

const LivestockEditForm = ({ animal, isOpen, onClose, onRefresh }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        name: animal?.name || '',
        tag_number: animal?.tag_number || '',
        gender: animal?.gender || 'female',
        birth_date: animal?.birth_date || '',
        acquisition_date: animal?.acquisition_date || '',
        acquisition_cost: animal?.acquisition_cost?.toString() || '',
        is_pregnant: animal?.is_pregnant || false,
        expected_birth_date: animal?.expected_birth_date || '',
        notes: animal?.notes || ''
    });

    const isFemale = formData.gender === 'female';

    // Validation functions
    const validateTagNumber = (tag) => {
        if (!tag || tag.trim() === '') return `${t('livestock.tagId')} ${t('common.isRequired')}`;
        if (tag.length < 2) return t('livestock.tagNumberMinLength');
        if (tag.length > 50) return t('livestock.tagNumberMaxLength');
        return '';
    };

    const validateDate = (date) => {
        if (!date) return '';
        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
        if (selected > today) return t('finance.dateNotFuture');
        return '';
    };

    const validateCost = (cost) => {
        if (!cost) return '';
        const num = parseFloat(cost);
        if (isNaN(num)) return t('livestock.acquisitionCostNegative');
        if (num < 0) return t('livestock.acquisitionCostNegative');
        if (num > 10000000) return t('finance.amountMax');
        return '';
    };

    const validateExpectedBirthDate = (date) => {
        if (!date) return '';
        if (!formData.is_pregnant) return '';
        
        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
        
        if (selected < today) return 'Expected birth date cannot be in the past';
        return '';
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        let error = '';
        if (field === 'tag_number') error = validateTagNumber(value);
        if (field === 'birth_date') error = validateDate(value);
        if (field === 'acquisition_date') error = validateDate(value);
        if (field === 'acquisition_cost') error = validateCost(value);
        if (field === 'expected_birth_date') error = validateExpectedBirthDate(value);
        
        // If gender changes to non-female, reset pregnancy fields
        if (field === 'gender' && value !== 'female') {
            setFormData(prev => ({
                ...prev,
                gender: value,
                is_pregnant: false,
                expected_birth_date: ''
            }));
        }
        
        setErrors(prev => error ? { ...prev, [field]: error } : { ...prev, [field]: undefined });
    };

    const handlePregnancyToggle = (checked) => {
        setFormData(prev => ({
            ...prev,
            is_pregnant: checked,
            expected_birth_date: checked ? prev.expected_birth_date : ''
        }));
        
        if (!checked) {
            setErrors(prev => ({ ...prev, expected_birth_date: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const tagError = validateTagNumber(formData.tag_number);
        if (tagError) newErrors.tag_number = tagError;
        
        if (formData.is_pregnant && !formData.expected_birth_date) {
            newErrors.expected_birth_date = 'Expected birth date is required for pregnant animals';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error(t('common.error'));
            return;
        }
        
        setLoading(true);
        try {
            await livestockService.updateAnimal(animal.id, {
                name: formData.name.trim(),
                tag_number: formData.tag_number.trim(),
                gender: formData.gender,
                birth_date: formData.birth_date || null,
                acquisition_date: formData.acquisition_date || null,
                acquisition_cost: formData.acquisition_cost ? parseFloat(formData.acquisition_cost) : 0,
                is_pregnant: formData.is_pregnant,
                expected_birth_date: formData.is_pregnant ? formData.expected_birth_date : null,
                notes: formData.notes || '',
            });
            toast.success(t('common.success'));
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const hasErrors = Object.values(errors).filter(e => e).length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto m-4">
                <div className="sticky top-0 bg-white border-b p-4">
                    <h2 className="text-xl font-bold">{t('common.edit')} {t('livestock.title')}</h2>
                </div>
                
                <div className="p-4 space-y-4">
                    {/* Tag Number */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase">{t('livestock.tagId')} *</Label>
                        <Input 
                            value={formData.tag_number} 
                            onChange={e => handleChange('tag_number', e.target.value)} 
                            className={errors.tag_number ? 'border-red-500' : ''}
                        />
                        {errors.tag_number && <p className="text-xs text-red-500">{errors.tag_number}</p>}
                    </div>
                    
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase">{t('livestock.name')}</Label>
                        <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                    </div>
                    
                    {/* Gender */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase">{t('livestock.gender')} *</Label>
                        <Select value={formData.gender} onValueChange={v => handleChange('gender', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">{t('livestock.genderMale')}</SelectItem>
                                <SelectItem value="female">{t('livestock.genderFemale')}</SelectItem>
                                <SelectItem value="unknown">{t('livestock.genderUnknown')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Pregnancy Section - Only for Female */}
                    {isFemale && (
                        <div className="space-y-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-sm font-semibold text-pink-700">
                                    <HeartPulse className="w-4 h-4" />
                                    Pregnancy Status
                                </Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">No</span>
                                    <button
                                        type="button"
                                        onClick={() => handlePregnancyToggle(!formData.is_pregnant)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            formData.is_pregnant ? 'bg-pink-600' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                formData.is_pregnant ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className="text-xs text-gray-500">Yes</span>
                                </div>
                            </div>
                            
                            {formData.is_pregnant && (
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-pink-700">
                                        <Calendar className="w-3 h-3 inline mr-1" />
                                        Expected Birth Date *
                                    </Label>
                                    <Input 
                                        type="date" 
                                        value={formData.expected_birth_date} 
                                        onChange={e => handleChange('expected_birth_date', e.target.value)} 
                                        className={errors.expected_birth_date ? 'border-red-500' : 'border-pink-200 focus:ring-pink-500'}
                                    />
                                    {errors.expected_birth_date && (
                                        <p className="text-xs text-red-500">{errors.expected_birth_date}</p>
                                    )}
                                    {formData.expected_birth_date && (
                                        <p className="text-xs text-pink-600">
                                            💡 {Math.ceil((new Date(formData.expected_birth_date) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Birth Date */}
                    <div className="space-y-1.5">
                        <Label><Calendar className="w-3 h-3 inline mr-1"/> {t('livestock.birthDate')}</Label>
                        <Input type="date" value={formData.birth_date} onChange={e => handleChange('birth_date', e.target.value)} />
                        {errors.birth_date && <p className="text-xs text-red-500">{errors.birth_date}</p>}
                    </div>

                    {/* Acquisition Date */}
                    <div className="space-y-1.5">
                        <Label><CalendarDays className="w-3 h-3 inline mr-1"/> {t('livestock.acquisitionDate')}</Label>
                        <Input type="date" value={formData.acquisition_date} onChange={e => handleChange('acquisition_date', e.target.value)} />
                        {errors.acquisition_date && <p className="text-xs text-red-500">{errors.acquisition_date}</p>}
                    </div>

                    {/* Acquisition Cost */}
                    <div className="space-y-1.5">
                        <Label><DollarSign className="w-3 h-3 inline mr-1"/> {t('livestock.acquisitionCost')} ({t('common.rs')})</Label>
                        <Input type="number" step="0.01" value={formData.acquisition_cost} onChange={e => handleChange('acquisition_cost', e.target.value)} />
                        {errors.acquisition_cost && <p className="text-xs text-red-500">{errors.acquisition_cost}</p>}
                    </div>
                    
                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label>{t('common.notes')}</Label>
                        <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} />
                    </div>
                    
                    {hasErrors && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-yellow-800 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3"/> Please fix errors above before saving
                            </p>
                        </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSubmit} disabled={loading || hasErrors} className="flex-1 bg-amber-600 hover:bg-amber-700">
                            {loading ? t('common.saving') : t('common.save')}
                        </Button>
                        <Button variant="outline" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivestockEditForm;