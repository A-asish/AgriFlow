import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { toast } from 'sonner';
import { Wheat, Map, Calendar, Info, Save, X, MapPin, Droplets, Mountain, AlertCircle } from 'lucide-react';
const NewCropPage = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [form, setForm] = useState({
        name: '',
        name_np: '',
        variety: '',
        field_name: '',
        field_area: '',
        area_unit: 'ropani',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        growth_stage: 'seeding',
        is_irrigated: false,
        soil_type: '',
        status: 'active',
        notes: '',
    });
    // Validation functions
    const validateRequired = (value, fieldName) => {
        if (!value || value.trim() === '')
            return `${fieldName} is required`;
        return '';
    };
    const validateName = (name) => {
        if (!name || name.trim() === '')
            return 'Crop name is required';
        if (name.length < 2)
            return 'Crop name must be at least 2 characters';
        if (name.length > 100)
            return 'Crop name must be less than 100 characters';
        return '';
    };
    const validateFieldName = (fieldName) => {
        if (!fieldName || fieldName.trim() === '')
            return 'Field name is required';
        if (fieldName.length < 2)
            return 'Field name must be at least 2 characters';
        if (fieldName.length > 100)
            return 'Field name must be less than 100 characters';
        return '';
    };
    const validateArea = (area) => {
        if (!area)
            return 'Area is required';
        const numArea = parseFloat(area);
        if (isNaN(numArea))
            return 'Please enter a valid number';
        if (numArea <= 0)
            return 'Area must be greater than 0';
        if (numArea > 10000)
            return 'Area must be less than 10000';
        return '';
    };
    const validateDate = (date) => {
        if (!date)
            return 'Planting date is required';
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > today)
            return 'Planting date cannot be in the future';
        if (selectedDate.getFullYear() < 2000)
            return 'Please enter a valid year';
        return '';
    };
    const validateFutureDate = (date) => {
        if (!date)
            return '';
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < today)
            return 'Expected harvest date cannot be in the past';
        return '';
    };
    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const n = { ...prev };
                delete n[field];
                return n;
            });
        }
        // Real-time validation
        if (field === 'name') {
            const error = validateName(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, name: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.name; return n; });
        }
        if (field === 'field_name') {
            const error = validateFieldName(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, field_name: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.field_name; return n; });
        }
        if (field === 'field_area') {
            const error = validateArea(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, field_area: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.field_area; return n; });
        }
        if (field === 'planting_date') {
            const error = validateDate(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, planting_date: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.planting_date; return n; });
        }
        if (field === 'expected_harvest_date') {
            const error = validateFutureDate(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, expected_harvest_date: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.expected_harvest_date; return n; });
        }
    };
    const validateForm = () => {
        const errors = {};
        const nameError = validateName(form.name);
        if (nameError)
            errors.name = nameError;
        const fieldNameError = validateFieldName(form.field_name);
        if (fieldNameError)
            errors.field_name = fieldNameError;
        const areaError = validateArea(form.field_area);
        if (areaError)
            errors.field_area = areaError;
        const dateError = validateDate(form.planting_date);
        if (dateError)
            errors.planting_date = dateError;
        if (form.expected_harvest_date) {
            const futureDateError = validateFutureDate(form.expected_harvest_date);
            if (futureDateError)
                errors.expected_harvest_date = futureDateError;
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        setLoading(true);
        try {
            const cropData = {
                name: form.name.trim(),
                name_np: form.name_np?.trim() || '',
                variety: form.variety?.trim() || '',
                field_name: form.field_name.trim(),
                field_area: parseFloat(form.field_area),
                area_unit: form.area_unit,
                planting_date: form.planting_date,
                expected_harvest_date: form.expected_harvest_date || null,
                growth_stage: form.growth_stage,
                is_irrigated: form.is_irrigated,
                soil_type: form.soil_type || '',
                status: form.status,
                notes: form.notes || '',
            };
            const response = await cropsService.createCrop(cropData);
            const createdCrop = response.data;
            const cropId = createdCrop.id;
            if (!cropId) {
                console.error('No ID in response:', createdCrop);
                toast.error('Crop created but ID not found');
                navigate('/crops');
                return;
            }
            toast.success(t('crops.addSuccess') || 'Crop added successfully');
            navigate(`/crops/${cropId}`);
        }
        catch (error) {
            console.error("Error adding crop:", error);
            if (error.response?.data) {
                const errorData = error.response.data;
                let errorMsg = 'Failed to add crop:\n\n';
                if (typeof errorData === 'object') {
                    Object.keys(errorData).forEach(key => {
                        const value = errorData[key];
                        if (Array.isArray(value)) {
                            errorMsg += `${key}: ${value.join(', ')}\n`;
                            setFieldErrors(prev => ({ ...prev, [key]: value.join(', ') }));
                        }
                        else {
                            errorMsg += `${key}: ${value}\n`;
                            setFieldErrors(prev => ({ ...prev, [key]: value }));
                        }
                    });
                }
                else {
                    errorMsg += errorData;
                }
                toast.error(errorMsg);
            }
            else {
                toast.error(t('crops.addError') || 'Failed to add crop');
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (<MainLayout title={t('crops.addNew') || 'Add New Crop'} subtitle={t('crops.addNewSubtitle') || 'Enter the details of the new crop'}>
      <div className="max-w-3xl mx-auto">
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information Section */}
          <div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-green-100 text-green-600">
                <Wheat className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('crops.basicInfo') || 'Basic Information'}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.cropNameEn') || 'Crop Name (EN)'} *
                </Label>
                <Input value={form.name} onChange={e => handleFieldChange('name', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.name ? 'border-red-500' : ''}`} placeholder="Rice"/>
                {fieldErrors.name && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.name}
                  </p>)}
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.cropNameNp') || 'Crop Name (NP)'}
                </Label>
                <Input value={form.name_np} onChange={e => handleFieldChange('name_np', e.target.value)} placeholder="धान" className="rounded-xl h-11 sm:h-12"/>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.variety') || 'Variety'}
                </Label>
                <Input value={form.variety} onChange={e => handleFieldChange('variety', e.target.value)} placeholder="Basmati" className="rounded-xl h-11 sm:h-12"/>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.growthStage') || 'Growth Stage'}
                </Label>
                <Select value={form.growth_stage} onValueChange={v => handleFieldChange('growth_stage', v)}>
                  <SelectTrigger className="rounded-xl h-11 sm:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeding">{t('crops.stageSeeding') || 'Seeding'}</SelectItem>
                    <SelectItem value="vegetative">{t('crops.stageVegetative') || 'Vegetative'}</SelectItem>
                    <SelectItem value="flowering">{t('crops.stageFlowering') || 'Flowering'}</SelectItem>
                    <SelectItem value="fruiting">{t('crops.stageFruiting') || 'Fruiting'}</SelectItem>
                    <SelectItem value="harvest">{t('crops.stageHarvest') || 'Harvest'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Field Information Section */}
          <div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-100 text-blue-600">
                <Map className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('crops.fieldInformation') || 'Field Information'}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.fieldName') || 'Field Name'} *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                  <Input type="text" value={form.field_name} onChange={e => handleFieldChange('field_name', e.target.value)} className={`rounded-xl h-11 sm:h-12 pl-10 ${fieldErrors.field_name ? 'border-red-500' : ''}`} placeholder="North Field"/>
                </div>
                {fieldErrors.field_name && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.field_name}
                  </p>)}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t('crops.area') || 'Area'} *
                  </Label>
                  <Input type="number" step="0.01" value={form.field_area} onChange={e => handleFieldChange('field_area', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.field_area ? 'border-red-500' : ''}`} placeholder="10.5"/>
                  {fieldErrors.field_area && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3"/> {fieldErrors.field_area}
                    </p>)}
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t('crops.unit') || 'Unit'}
                  </Label>
                  <Select value={form.area_unit} onValueChange={v => handleFieldChange('area_unit', v)}>
                    <SelectTrigger className="rounded-xl h-11 sm:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ropani">Ropani</SelectItem>
                      <SelectItem value="bigha">Bigha</SelectItem>
                      <SelectItem value="kattha">Kattha</SelectItem>
                      <SelectItem value="hectare">Hectare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.soilType') || 'Soil Type'}
                </Label>
                <div className="relative">
                  <Mountain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                  <Select value={form.soil_type} onValueChange={v => handleFieldChange('soil_type', v)}>
                    <SelectTrigger className="rounded-xl h-11 sm:h-12 pl-10">
                      <SelectValue placeholder="Select soil type"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="loam">Loam</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                      <SelectItem value="silt">Silt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 flex items-center h-full">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_irrigated} onChange={e => handleFieldChange('is_irrigated', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"/>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Droplets className="h-4 w-4"/>
                    {t('crops.irrigated') || 'Irrigated Crop'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-100 text-purple-600">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('crops.areaAndDate') || 'Dates'}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.plantingDate') || 'Planting Date'} *
                </Label>
                <Input type="date" value={form.planting_date} onChange={e => handleFieldChange('planting_date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.planting_date ? 'border-red-500' : ''}`}/>
                {fieldErrors.planting_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.planting_date}
                  </p>)}
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {t('crops.expectedHarvest') || 'Expected Harvest'}
                </Label>
                <Input type="date" value={form.expected_harvest_date} onChange={e => handleFieldChange('expected_harvest_date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.expected_harvest_date ? 'border-red-500' : ''}`}/>
                {fieldErrors.expected_harvest_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.expected_harvest_date}
                  </p>)}
              </div>
            </div>
          </div>

          {/* Additional Notes Section */}
          <div className="farm-card p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-gray-100 text-gray-600">
                <Info className="w-5 h-5 sm:w-6 sm:h-6"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('crops.additionalNotes') || 'Additional Notes'}</h3>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('crops.notes') || 'Notes'}
              </Label>
              <Textarea value={form.notes} onChange={e => handleFieldChange('notes', e.target.value)} placeholder={t('crops.notesPlaceholder') || "Any additional information about this crop..."} className="rounded-xl min-h-30 sm:min-h-37.5 resize-none"/>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/crops')} className="w-full sm:w-auto rounded-xl h-11 sm:h-12 px-8 font-bold gap-2">
              <X className="w-4 h-4"/> {t('.cancel') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading || Object.keys(fieldErrors).length > 0} className="w-full sm:flex-1 rounded-xl h-11 sm:h-12 font-bold gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg">
              <Save className="w-4 h-4"/> {loading ? (t('common.saving') || 'Saving...') : (t('crops.saveCrop') || 'Save Crop')}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>);
};
export default NewCropPage;
