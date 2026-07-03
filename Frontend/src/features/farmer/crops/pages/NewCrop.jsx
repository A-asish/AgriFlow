// src/features/farmer/crops/pages/NewCrop.jsx

import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { toast } from 'sonner';
import { Wheat, Map, Calendar, Info, Save, X, MapPin, Droplets, Mountain, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';

const NewCropPage = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    
    // Dropdown data states
    const [availableCrops, setAvailableCrops] = useState([]);
    const [cropVarieties, setCropVarieties] = useState([]);
    const [cropRegions, setCropRegions] = useState([]);
    const [cropRegionDisplays, setCropRegionDisplays] = useState([]);
    const [cropSeasons, setCropSeasons] = useState([]);
    const [cropSeasonDisplays, setCropSeasonDisplays] = useState([]);
    const [loadingConfigs, setLoadingConfigs] = useState(true);
    const [isOtherCrop, setIsOtherCrop] = useState(false);
    const [selectedCropName, setSelectedCropName] = useState('');
    
    const [form, setForm] = useState({
        name: '',
        name_np: '',
        variety: '',
        region: '',
        season: '',
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

    // Fetch available crops on component mount
    useEffect(() => {
        fetchAvailableCrops();
    }, []);

    const fetchAvailableCrops = async () => {
        setLoadingConfigs(true);
        try {
            const response = await cropsService.getAvailableCrops();
            console.log('Available crops response:', response.data);
            setAvailableCrops(response.data.crops || []);
        } catch (error) {
            console.error('Error fetching crops:', error);
            toast.error(t('common.error') || 'Failed to load crop options');
        } finally {
            setLoadingConfigs(false);
        }
    };

    const fetchCropVarieties = async (cropName) => {
        if (!cropName || cropName === 'other') return;
        
        try {
            const response = await cropsService.getCropVarieties(cropName);
            if (response.data.success) {
                setCropVarieties(response.data.varieties || []);
                setCropRegions(response.data.regions || []);
                setCropRegionDisplays(response.data.region_displays || []);
                setCropSeasons(response.data.seasons || []);
                setCropSeasonDisplays(response.data.season_displays || []);
            }
        } catch (error) {
            console.error('Error fetching varieties:', error);
        }
    };

    const handleCropSelect = (value) => {
        if (value === 'other') {
            setIsOtherCrop(true);
            setSelectedCropName('');
            setForm(prev => ({
                ...prev,
                name: '',
                name_np: '',
                variety: '',
                region: '',
                season: ''
            }));
            setCropVarieties([]);
            setCropRegions([]);
            setCropRegionDisplays([]);
            setCropSeasons([]);
            setCropSeasonDisplays([]);
        } else {
            setIsOtherCrop(false);
            setSelectedCropName(value);
            
            const selectedCrop = availableCrops.find(c => c.crop_name === value);
            
            setForm(prev => ({
                ...prev,
                name: value,
                name_np: selectedCrop?.name_np || '',
                variety: '',
                region: '',
                season: ''
            }));
            
            fetchCropVarieties(value);
        }
    };

    const handleVarietySelect = (value) => {
        setForm(prev => ({ ...prev, variety: value }));
    };

    const handleRegionSelect = (value) => {
        setForm(prev => ({ ...prev, region: value }));
    };

    const handleSeasonSelect = (value) => {
        setForm(prev => ({ ...prev, season: value }));
    };

    // Validation functions with translations
    const validateName = (name) => {
        if (!name || name.trim() === '')
            return t('crops.cropNameRequired') || 'Crop name is required';
        if (name.length < 2)
            return t('crops.tagNumberMinLength') || 'Crop name must be at least 2 characters';
        if (name.length > 100)
            return t('crops.tagNumberMaxLength') || 'Crop name must be less than 100 characters';
        return '';
    };

    const validateFieldName = (fieldName) => {
        if (!fieldName || fieldName.trim() === '')
            return t('crops.fieldNameRequired') || 'Field name is required';
        if (fieldName.length < 2)
            return t('crops.fieldNameMinLength') || 'Field name must be at least 2 characters';
        if (fieldName.length > 100)
            return t('crops.fieldNameMaxLength') || 'Field name must be less than 100 characters';
        return '';
    };

    const validateArea = (area) => {
        if (!area)
            return t('crops.areaRequired') || 'Area is required';
        const numArea = parseFloat(area);
        if (isNaN(numArea))
            return t('crops.areaInvalid') || 'Please enter a valid number';
        if (numArea <= 0)
            return t('crops.areaPositive') || 'Area must be greater than 0';
        if (numArea > 10000)
            return t('crops.areaMax') || 'Area must be less than 10000';
        return '';
    };

    const validateDate = (date) => {
        if (!date)
            return t('crops.plantingDateRequired') || 'Planting date is required';
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > today)
            return t('finance.dateNotFuture') || 'Planting date cannot be in the future';
        if (selectedDate.getFullYear() < 2000)
            return t('crops.validYear') || 'Please enter a valid year';
        return '';
    };

    const validateFutureDate = (date) => {
        if (!date) return '';
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < today)
            return t('crops.harvestDatePast') || 'Expected harvest date cannot be in the past';
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
            if (error) setFieldErrors(prev => ({ ...prev, name: error }));
            else setFieldErrors(prev => { const n = { ...prev }; delete n.name; return n; });
        }
        if (field === 'field_name') {
            const error = validateFieldName(value);
            if (error) setFieldErrors(prev => ({ ...prev, field_name: error }));
            else setFieldErrors(prev => { const n = { ...prev }; delete n.field_name; return n; });
        }
        if (field === 'field_area') {
            const error = validateArea(value);
            if (error) setFieldErrors(prev => ({ ...prev, field_area: error }));
            else setFieldErrors(prev => { const n = { ...prev }; delete n.field_area; return n; });
        }
        if (field === 'planting_date') {
            const error = validateDate(value);
            if (error) setFieldErrors(prev => ({ ...prev, planting_date: error }));
            else setFieldErrors(prev => { const n = { ...prev }; delete n.planting_date; return n; });
        }
        if (field === 'expected_harvest_date') {
            const error = validateFutureDate(value);
            if (error) setFieldErrors(prev => ({ ...prev, expected_harvest_date: error }));
            else setFieldErrors(prev => { const n = { ...prev }; delete n.expected_harvest_date; return n; });
        }
    };

    const validateForm = () => {
        const errors = {};
        const nameError = validateName(form.name);
        if (nameError) errors.name = nameError;
        const fieldNameError = validateFieldName(form.field_name);
        if (fieldNameError) errors.field_name = fieldNameError;
        const areaError = validateArea(form.field_area);
        if (areaError) errors.field_area = areaError;
        const dateError = validateDate(form.planting_date);
        if (dateError) errors.planting_date = dateError;
        if (form.expected_harvest_date) {
            const futureDateError = validateFutureDate(form.expected_harvest_date);
            if (futureDateError) errors.expected_harvest_date = futureDateError;
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error(t('common.errorFix') || 'Please fix the errors in the form');
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
                toast.error(t('common.error') || 'Crop created but ID not found');
                navigate('/crops');
                return;
            }
            
            toast.success(t('crops.addSuccess') || 'Crop added successfully');
            navigate(`/crops/${cropId}`);
        } catch (error) {
            console.error("Error adding crop:", error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    Object.keys(errorData).forEach(key => {
                        const value = errorData[key];
                        if (Array.isArray(value)) {
                            setFieldErrors(prev => ({ ...prev, [key]: value.join(', ') }));
                        } else {
                            setFieldErrors(prev => ({ ...prev, [key]: value }));
                        }
                    });
                }
                toast.error(t('common.error') || 'Failed to add crop');
            } else {
                toast.error(t('crops.addError') || 'Failed to add crop');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loadingConfigs) {
        return (
            <MainLayout 
                title={t('crops.addNew') || 'Add New Crop'} 
                subtitle={t('crops.addNewSubtitle') || 'Enter the details of the new crop'}
            >
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    <span className="ml-2 text-gray-600">{t('common.loading') || 'Loading...'}</span>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout 
            title={t('crops.addNew') || 'Add New Crop'} 
            subtitle={t('crops.addNewSubtitle') || 'Enter the details of the new crop'}
        >
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <div className="mb-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/crops')} 
                        className="rounded-xl gap-2 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-4 h-4"/> {t('common.backToCrops') || 'Back to Crops'}
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Basic Information Section */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-green-100 text-green-600">
                                <Wheat className="w-5 h-5 sm:w-6 sm:h-6"/>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold">{t('crops.basicInfo') || 'Basic Information'}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Crop Name Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {t('crops.cropNameEn') || 'Crop Name'} *
                                </Label>
                                <Select 
                                    value={isOtherCrop ? 'other' : selectedCropName} 
                                    onValueChange={handleCropSelect}
                                >
                                    <SelectTrigger className={`rounded-xl h-11 ${fieldErrors.name ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder={t('crops.selectCrop') || 'Select a crop'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCrops.map((crop) => (
                                            <SelectItem key={crop.crop_name} value={crop.crop_name}>
                                                {crop.crop_name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="other">+ {t('crops.other') || 'Other (Manual Entry)'}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/> {fieldErrors.name}
                                    </p>
                                )}
                                {!isOtherCrop && selectedCropName && (
                                    <p className="text-xs text-green-600">
                                        ✓ {t('crops.configuredCrop') || 'Configured crop - will receive automated reminders'}
                                    </p>
                                )}
                            </div>

                            {/* Manual Crop Name Input */}
                            {isOtherCrop && (
                                <>
                                    <div className="space-y-2">
                                        <Label>{t('crops.cropNameEn') || 'Crop Name (EN)'} *</Label>
                                        <Input 
                                            value={form.name} 
                                            onChange={e => handleFieldChange('name', e.target.value)} 
                                            className={`rounded-xl h-11 ${fieldErrors.name ? 'border-red-500' : ''}`} 
                                            placeholder={t('crops.cropNamePlaceholder') || 'e.g., Buckwheat'}
                                        />
                                        {fieldErrors.name && (
                                            <p className="text-xs text-red-500">{fieldErrors.name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>{t('crops.cropNameNp') || 'Crop Name (NP)'}</Label>
                                        <Input 
                                            value={form.name_np} 
                                            onChange={e => handleFieldChange('name_np', e.target.value)} 
                                            placeholder={t('crops.cropNameNpPlaceholder') || 'e.g., फापर'} 
                                            className="rounded-xl h-11"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Variety Dropdown */}
                            {!isOtherCrop && selectedCropName && cropVarieties.length > 0 && (
                                <div className="space-y-2">
                                    <Label>{t('crops.variety') || 'Variety'}</Label>
                                    <Select value={form.variety || undefined} onValueChange={handleVarietySelect}>
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue placeholder={t('crops.selectVariety') || '-- Select variety --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cropVarieties.map((variety) => (
                                                <SelectItem key={variety} value={variety}>
                                                    {variety}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Variety Input for Other crop */}
                            {isOtherCrop && (
                                <div className="space-y-2">
                                    <Label>{t('crops.variety') || 'Variety'}</Label>
                                    <Input 
                                        value={form.variety} 
                                        onChange={e => handleFieldChange('variety', e.target.value)} 
                                        placeholder={t('crops.varietyPlaceholder') || 'e.g., Local, Hybrid'} 
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            )}

                            {/* Region Dropdown */}
                            {!isOtherCrop && selectedCropName && cropRegions.length > 0 && (
                                <div className="space-y-2">
                                    <Label>{t('crops.region') || 'Region'}</Label>
                                    <Select value={form.region || undefined} onValueChange={handleRegionSelect}>
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue placeholder={t('crops.selectRegion') || '-- Select region --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cropRegions.map((region, index) => (
                                                <SelectItem key={region} value={region}>
                                                    {cropRegionDisplays[index] || region}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Season Dropdown */}
                            {!isOtherCrop && selectedCropName && cropSeasons.length > 0 && (
                                <div className="space-y-2">
                                    <Label>{t('crops.season') || 'Growing Season'}</Label>
                                    <Select value={form.season || undefined} onValueChange={handleSeasonSelect}>
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue placeholder={t('crops.selectSeason') || '-- Select season --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cropSeasons.map((season, index) => (
                                                <SelectItem key={season} value={season}>
                                                    {cropSeasonDisplays[index] || season}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Growth Stage */}
                            <div className="space-y-2">
                                <Label>{t('crops.growthStage') || 'Growth Stage'}</Label>
                                <Select value={form.growth_stage} onValueChange={v => handleFieldChange('growth_stage', v)}>
                                    <SelectTrigger className="rounded-xl h-11">
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

                            {/* Info box for custom crops */}
                            {isOtherCrop && (
                                <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-yellow-800 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {t('crops.customCropWarning') || 'Note: This is a custom crop. You won\'t receive automated activity reminders. To get reminders, ask admin to add this crop configuration.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Field Information Section */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                                <Map className="w-5 h-5"/>
                            </div>
                            <h3 className="text-lg font-bold">{t('crops.fieldInformation') || 'Field Information'}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('crops.fieldName') || 'Field Name'} *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                                    <Input 
                                        value={form.field_name} 
                                        onChange={e => handleFieldChange('field_name', e.target.value)} 
                                        className={`rounded-xl h-11 pl-10 ${fieldErrors.field_name ? 'border-red-500' : ''}`} 
                                        placeholder={t('crops.fieldNamePlaceholder') || 'North Field'}
                                    />
                                </div>
                                {fieldErrors.field_name && (
                                    <p className="text-xs text-red-500">{fieldErrors.field_name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2 space-y-2">
                                    <Label>{t('crops.area') || 'Area'} *</Label>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        value={form.field_area} 
                                        onChange={e => handleFieldChange('field_area', e.target.value)} 
                                        className={`rounded-xl h-11 ${fieldErrors.field_area ? 'border-red-500' : ''}`} 
                                        placeholder="10.5"
                                    />
                                    {fieldErrors.field_area && (
                                        <p className="text-xs text-red-500">{fieldErrors.field_area}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('crops.unit') || 'Unit'}</Label>
                                    <Select value={form.area_unit} onValueChange={v => handleFieldChange('area_unit', v)}>
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ropani">{t('crops.ropani') || 'Ropani'}</SelectItem>
                                            <SelectItem value="bigha">{t('crops.bigha') || 'Bigha'}</SelectItem>
                                            <SelectItem value="kattha">{t('crops.kattha') || 'Kattha'}</SelectItem>
                                            <SelectItem value="hectare">{t('crops.hectare') || 'hectare'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('crops.soilType') || 'Soil Type'}</Label>
                                <div className="relative">
                                    <Mountain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                                    <Select value={form.soil_type || undefined} onValueChange={v => handleFieldChange('soil_type', v)}>
                                        <SelectTrigger className="rounded-xl h-11 pl-10">
                                            <SelectValue placeholder={t('crops.selectSoilType') || 'Select soil type'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="clay">{t('crops.soilClay') || 'Clay'}</SelectItem>
                                            <SelectItem value="loam">{t('crops.soilLoam') || 'Loam'}</SelectItem>
                                            <SelectItem value="sandy">{t('crops.soilSandy') || 'Sandy'}</SelectItem>
                                            <SelectItem value="silt">{t('crops.soilSilt') || 'Silt'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center h-full">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={form.is_irrigated} 
                                        onChange={e => handleFieldChange('is_irrigated', e.target.checked)} 
                                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <Droplets className="h-4 w-4"/>
                                        {t('crops.irrigated') || 'Irrigated Crop'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Dates Section */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                                <Calendar className="w-5 h-5"/>
                            </div>
                            <h3 className="text-lg font-bold">{t('crops.dates') || 'Dates'}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('crops.plantingDate') || 'Planting Date'} *</Label>
                                <Input 
                                    type="date" 
                                    value={form.planting_date} 
                                    onChange={e => handleFieldChange('planting_date', e.target.value)} 
                                    className={`rounded-xl h-11 ${fieldErrors.planting_date ? 'border-red-500' : ''}`}
                                />
                                {fieldErrors.planting_date && (
                                    <p className="text-xs text-red-500">{fieldErrors.planting_date}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label>{t('crops.expectedHarvest') || 'Expected Harvest'}</Label>
                                <Input 
                                    type="date" 
                                    value={form.expected_harvest_date} 
                                    onChange={e => handleFieldChange('expected_harvest_date', e.target.value)} 
                                    className={`rounded-xl h-11 ${fieldErrors.expected_harvest_date ? 'border-red-500' : ''}`}
                                />
                                {fieldErrors.expected_harvest_date && (
                                    <p className="text-xs text-red-500">{fieldErrors.expected_harvest_date}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gray-100 text-gray-600">
                                <Info className="w-5 h-5"/>
                            </div>
                            <h3 className="text-lg font-bold">{t('crops.additionalNotes') || 'Additional Notes'}</h3>
                        </div>
                        
                        <Textarea 
                            value={form.notes} 
                            onChange={e => handleFieldChange('notes', e.target.value)} 
                            placeholder={t('crops.notesPlaceholder') || "Any additional information about this crop..."} 
                            className="rounded-xl min-h-30 resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-8">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate('/crops')} 
                            className="w-full sm:w-auto rounded-xl h-11 px-8 font-bold gap-2"
                        >
                            <X className="w-4 h-4"/> {t('common.cancel') || 'Cancel'}
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || Object.keys(fieldErrors).length > 0} 
                            className="w-full sm:flex-1 rounded-xl h-11 font-bold gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Save className="w-4 h-4"/> 
                            {loading ? (t('common.saving') || 'Saving...') : (t('crops.saveCrop') || 'Save Crop')}
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default NewCropPage;