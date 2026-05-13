import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { livestockService } from '@/features/farmer/livestock/services/livestock.api';
import { toast } from 'sonner';
import { Beef, Tag, Calendar, Info, Save, X, HeartPulse, Sprout, Store, AlertCircle } from 'lucide-react';
const NewAnimalPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [animalTypes, setAnimalTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    // Add acquisition type field
    const [acquisitionType, setAcquisitionType] = useState('purchased');
    // Form fields matching Django model
    const [form, setForm] = useState({
        animal_type: '',
        name: '',
        tag_number: '',
        birth_date: '',
        acquisition_date: '',
        acquisition_cost: '',
        gender: 'female',
        is_pregnant: false,
        last_pregnancy_date: '',
        expected_birth_date: '',
        notes: ''
    });
    // Fetch animal types only
    useEffect(() => {
        const fetchAnimalTypes = async () => {
            try {
                const typesResponse = await livestockService.getAnimalTypes();
                setAnimalTypes(typesResponse.data);
                setLoadingTypes(false);
            }
            catch (error) {
                console.error('Error fetching animal types:', error);
                toast.error(t('common.error'));
                setLoadingTypes(false);
            }
        };
        fetchAnimalTypes();
    }, [t]);
    // Set default acquisition date for purchased animals
    useEffect(() => {
        if (!form.acquisition_date && acquisitionType === 'purchased') {
            setForm(prev => ({ ...prev, acquisition_date: new Date().toISOString().split('T')[0] }));
        }
    }, [acquisitionType]);
    // Real-time validation function
    const validateField = (field, value) => {
        switch (field) {
            case 'animal_type':
                if (!value)
                    return `${t('livestock.animalType')} ${t('common.isRequired')}`;
                return null;
            case 'tag_number':
                if (!value)
                    return `${t('livestock.tagId')} ${t('common.isRequired')}`;
                if (value.length < 2)
                    return t('livestock.tagNumberMinLength');
                return null;
            case 'gender':
                if (!value)
                    return `${t('livestock.gender')} ${t('common.isRequired')}`;
                return null;
            case 'acquisition_date':
                if (acquisitionType === 'purchased' && !value)
                    return `${t('livestock.acquisitionDate')} ${t('common.isRequired')}`;
                return null;
            case 'birth_date':
                if (acquisitionType === 'born' && !value)
                    return `${t('livestock.birthDate')} ${t('common.isRequired')}`;
                return null;
            case 'last_pregnancy_date':
                if (form.is_pregnant && !value)
                    return `${t('livestock.lastPregnancyDate')} ${t('common.isRequired')}`;
                return null;
            case 'acquisition_cost':
                if (value && parseFloat(value) < 0)
                    return t('livestock.acquisitionCostNegative');
                return null;
            default:
                return null;
        }
    };
    // Get field error
    const getFieldError = (field) => {
        if (!touched[field])
            return null;
        return validateField(field, form[field]);
    };
    // Handle field change with validation
    const handleFieldChange = (field, value) => {
        setForm({ ...form, [field]: value });
        setTouched({ ...touched, [field]: true });
    };
    // Check if form is valid
    const isFormValid = () => {
        const requiredFields = ['animal_type', 'tag_number', 'gender'];
        if (acquisitionType === 'purchased')
            requiredFields.push('acquisition_date');
        if (acquisitionType === 'born')
            requiredFields.push('birth_date');
        if (form.is_pregnant)
            requiredFields.push('last_pregnancy_date');
        for (const field of requiredFields) {
            if (!form[field])
                return false;
        }
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Mark all fields as touched
        const allFields = ['animal_type', 'tag_number', 'gender'];
        if (acquisitionType === 'purchased')
            allFields.push('acquisition_date');
        if (acquisitionType === 'born')
            allFields.push('birth_date');
        if (form.is_pregnant)
            allFields.push('last_pregnancy_date');
        const newTouched = {};
        allFields.forEach(field => { newTouched[field] = true; });
        setTouched(newTouched);
        // Validate all fields
        if (!isFormValid()) {
            toast.error(t('livestock.fillRequiredFields'));
            return;
        }
        setErrors({});
        setLoading(true);
        let submitData = {
            animal_type: parseInt(form.animal_type),
            name: form.name || "",
            tag_number: form.tag_number,
            birth_date: form.birth_date || null,
            gender: form.gender,
            status: 'active',
            is_pregnant: form.is_pregnant,
            notes: form.notes || ""
        };
        if (acquisitionType === 'purchased') {
            submitData = {
                ...submitData,
                acquisition_date: form.acquisition_date,
                acquisition_cost: parseFloat(form.acquisition_cost) || 0,
                last_pregnancy_date: form.is_pregnant ? form.last_pregnancy_date : null,
                expected_birth_date: form.expected_birth_date || null,
            };
        }
        else {
            submitData = {
                ...submitData,
                acquisition_date: form.birth_date,
                acquisition_cost: 0,
                last_pregnancy_date: form.is_pregnant ? form.last_pregnancy_date : null,
                expected_birth_date: form.expected_birth_date || null,
            };
        }
        console.log('Submitting animal data:', submitData);
        try {
            await livestockService.createAnimal(submitData);
            toast.success(acquisitionType === 'purchased' ? t('livestock.addSuccess') : t('livestock.bornAnimalAddSuccess'));
            navigate('/livestock');
        }
        catch (error) {
            console.error("Error adding animal:", error);
            if (error.response?.data) {
                setErrors(error.response.data);
                const firstError = Object.values(error.response.data)[0];
                if (Array.isArray(firstError)) {
                    toast.error(firstError[0]);
                }
                else {
                    toast.error(t('livestock.addErrorCheckForm'));
                }
            }
            else {
                toast.error(t('livestock.addError'));
            }
        }
        finally {
            setLoading(false);
        }
    };
    const today = new Date().toISOString().split('T')[0];
    return (<MainLayout title={t('livestock.addNew')} subtitle={t('livestock.addNewSubtitle')}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Acquisition Type Selection - Brown Theme */}
          <div className="farm-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Store className="w-4 h-4 sm:w-5 sm:h-5"/>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {t('livestock.animalOrigin')} <span className="text-red-500 text-sm">*</span>
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setAcquisitionType('purchased')} className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${acquisitionType === 'purchased'
            ? 'border-amber-600 bg-amber-50'
            : 'border-gray-200 hover:border-amber-300'}`}>
                <Store className={`w-5 h-5 mx-auto mb-1 ${acquisitionType === 'purchased' ? 'text-amber-700' : 'text-gray-400'}`}/>
                <p className={`text-sm font-semibold ${acquisitionType === 'purchased' ? 'text-amber-800' : 'text-gray-600'}`}>{t('livestock.purchased')}</p>
                <p className="text-xs text-gray-500">{t('livestock.purchasedDesc')}</p>
              </button>
              
              <button type="button" onClick={() => setAcquisitionType('born')} className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${acquisitionType === 'born'
            ? 'border-amber-600 bg-amber-50'
            : 'border-gray-200 hover:border-amber-300'}`}>
                <Sprout className={`w-5 h-5 mx-auto mb-1 ${acquisitionType === 'born' ? 'text-amber-700' : 'text-gray-400'}`}/>
                <p className={`text-sm font-semibold ${acquisitionType === 'born' ? 'text-amber-800' : 'text-gray-600'}`}>{t('livestock.bornOnFarm')}</p>
                <p className="text-xs text-gray-500">{t('livestock.bornOnFarmDesc')}</p>
              </button>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-green-100 text-green-700">
                <Beef className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('livestock.basicInfo')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Animal Type - REQUIRED */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('livestock.animalType')} <span className="text-red-500">*</span>
                </Label>
                <Select value={form.animal_type} onValueChange={v => handleFieldChange('animal_type', v)} disabled={loadingTypes}>
                  <SelectTrigger className={`rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 ${getFieldError('animal_type') ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={loadingTypes ? t('common.loading') : t('livestock.selectType')}/>
                  </SelectTrigger>
                  <SelectContent>
                    {animalTypes.map((type) => (<SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} {type.name_np ? `(${type.name_np})` : ''}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
                {getFieldError('animal_type') && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {getFieldError('animal_type')}
                  </p>)}
                {errors.animal_type && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {errors.animal_type[0]}
                  </p>)}
              </div>

              {/* Tag Number - REQUIRED */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  <Tag className="w-3 h-3 inline mr-1"/> {t('livestock.tagId')} <span className="text-red-500">*</span>
                </Label>
                <Input value={form.tag_number} onChange={e => handleFieldChange('tag_number', e.target.value)} placeholder={acquisitionType === 'born' ? t('livestock.tagPlaceholderBorn') : t('livestock.tagPlaceholderPurchased')} className={`rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 ${getFieldError('tag_number') ? 'border-red-500' : ''}`}/>
                {getFieldError('tag_number') && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {getFieldError('tag_number')}
                  </p>)}
                {errors.tag_number && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {errors.tag_number[0]}
                  </p>)}
              </div>

              {/* Name - OPTIONAL */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('livestock.name')}
                </Label>
                <Input value={form.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder={t('livestock.namePlaceholder')} className="rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"/>
              </div>

              {/* Gender - REQUIRED */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('livestock.gender')} <span className="text-red-500">*</span>
                </Label>
                <Select value={form.gender} onValueChange={v => handleFieldChange('gender', v)}>
                  <SelectTrigger className={`rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 ${getFieldError('gender') ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('livestock.genderMale')}</SelectItem>
                    <SelectItem value="female">{t('livestock.genderFemale')}</SelectItem>
                    <SelectItem value="unknown">{t('livestock.genderUnknown')}</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError('gender') && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {getFieldError('gender')}
                  </p>)}
                {errors.gender && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {errors.gender[0]}
                  </p>)}
              </div>
            </div>
          </div>

          {/* Date Information Section - Context Aware */}
          <div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-100 text-blue-700">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {acquisitionType === 'born' ? t('livestock.birthInformation') : t('livestock.acquisitionInformation')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Birth Date - REQUIRED for born */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('livestock.birthDate')} 
                  {acquisitionType === 'born' && <span className="text-red-500">*</span>}
                </Label>
                <Input type="date" value={form.birth_date} onChange={e => handleFieldChange('birth_date', e.target.value)} max={today} className={`rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 ${getFieldError('birth_date') ? 'border-red-500' : ''}`}/>
                {getFieldError('birth_date') && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {getFieldError('birth_date')}
                  </p>)}
              </div>

              {/* Acquisition Date - REQUIRED for purchased */}
              {acquisitionType === 'purchased' && (<>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      {t('livestock.acquisitionDate')} <span className="text-red-500">*</span>
                    </Label>
                    <Input type="date" value={form.acquisition_date} onChange={e => handleFieldChange('acquisition_date', e.target.value)} max={today} className={`rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 ${getFieldError('acquisition_date') ? 'border-red-500' : ''}`}/>
                    {getFieldError('acquisition_date') && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3"/> {getFieldError('acquisition_date')}
                      </p>)}
                    {errors.acquisition_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3"/> {errors.acquisition_date[0]}
                      </p>)}
                  </div>

                  {/* Acquisition Cost - OPTIONAL with Rs */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      {t('livestock.acquisitionCost')} ({t('common.rs')})
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        Rs
                      </span>
                      <Input type="number" step="0.01" value={form.acquisition_cost} onChange={e => handleFieldChange('acquisition_cost', e.target.value)} placeholder={t('livestock.acquisitionCostPlaceholder')} className="rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 pl-12"/>
                    </div>
                    {getFieldError('acquisition_cost') && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3"/> {getFieldError('acquisition_cost')}
                      </p>)}
                    {errors.acquisition_cost && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3"/> {errors.acquisition_cost[0]}
                      </p>)}
                  </div>
                </>)}
            </div>
          </div>

          {/* Pregnancy Information Section - Only for females and context-aware */}
          {form.gender === 'female' && (<div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 rounded-xl bg-pink-100 text-pink-600">
                  <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6"/>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('livestock.pregnancyInformation')}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Is Pregnant */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t('livestock.isPregnant')}
                  </Label>
                  <Select value={form.is_pregnant ? "yes" : "no"} onValueChange={v => {
                const isPregnant = v === "yes";
                handleFieldChange('is_pregnant', isPregnant);
                if (!isPregnant) {
                    handleFieldChange('last_pregnancy_date', '');
                    handleFieldChange('expected_birth_date', '');
                }
            }}>
                    <SelectTrigger className="rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('common.yes')}</SelectItem>
                      <SelectItem value="no">{t('common.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Last Pregnancy Date - REQUIRED if pregnant */}
                {form.is_pregnant && (<>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {t('livestock.lastPregnancyDate')} <span className="text-red-500">*</span>
                      </Label>
                      <Input type="date" value={form.last_pregnancy_date} onChange={e => handleFieldChange('last_pregnancy_date', e.target.value)} max={today} className={`rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 ${getFieldError('last_pregnancy_date') ? 'border-red-500' : ''}`}/>
                      {getFieldError('last_pregnancy_date') && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3"/> {getFieldError('last_pregnancy_date')}
                        </p>)}
                      {errors.last_pregnancy_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3"/> {errors.last_pregnancy_date[0]}
                        </p>)}
                      <p className="text-xs text-muted-foreground">
                       {t('livestock.lastPregnancyDateNote')}
                      </p>
                    </div>

                    {/* Expected Birth Date - OPTIONAL */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {t('livestock.expectedBirthDate')}
                      </Label>
                      <Input type="date" value={form.expected_birth_date} onChange={e => handleFieldChange('expected_birth_date', e.target.value)} className="rounded-xl h-11 sm:h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"/>
                    </div>
                  </>)}
              </div>
            </div>)}

          {/* Notes Section - OPTIONAL */}
          <div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-gray-100 text-gray-700">
                <Info className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('livestock.additionalNotes')}</h3>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('livestock.notes')}</Label>
              <Textarea value={form.notes} onChange={e => handleFieldChange('notes', e.target.value)} placeholder={acquisitionType === 'born'
            ? t('livestock.notesPlaceholderBorn')
            : t('common.notesPlaceholder')} className="rounded-xl min-h-30 resize-none border-gray-200 focus:border-green-500 focus:ring-green-500"/>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/livestock')} className="w-full sm:w-auto rounded-xl h-11 sm:h-12 px-8 font-bold gap-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors">
              <X className="w-4 h-4"/> {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:flex-1 rounded-xl h-11 sm:h-12 font-bold gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200">
              <Save className="w-4 h-4"/> {loading ? t('common.saving') : (acquisitionType === 'born' ? t('livestock.saveBornAnimal') : t('livestock.saveAnimal'))}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>);
};
export default NewAnimalPage;
