import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Wheat, Calendar, Info, ChevronLeft, Droplets, Sprout, Trash2, Edit2, AlertCircle, MapPin, Mountain, Archive, RefreshCw, Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { OverviewTab } from '../components/tabs/OverviewTab';
import { FinanceTab } from '../components/tabs/FinanceTab';
import { FertilizerTab } from '../components/tabs/FertilizerTab';
import { PesticideTab } from '../components/tabs/PesticideTab';
import { LaborTab } from '../components/tabs/LaborTab';
import { HarvestTab } from '../components/tabs/HarvestTab';

const CropDetailPage = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    // Edit Dialog states
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        name_np: '',
        variety: '',
        field_name: '',
        field_area: '',
        area_unit: 'ropani',
        planting_date: '',
        expected_harvest_date: '',
        growth_stage: 'seeding',
        is_irrigated: false,
        soil_type: '',
        status: 'active',
        notes: '',
    });
    const [editErrors, setEditErrors] = useState({});
    // Status-based access control
    const isActive = crop?.status === 'active';
    const isHarvested = crop?.status === 'harvested';
    const isDone = crop?.status === 'done' || crop?.status === 'failed';
    // Check if growth stage is manually overridden (auto-calc disabled)
    const isGrowthStageLocked = crop?.growth_stage_manual_override === true;
    // Permissions
    const canEdit = isActive;
    const canAddFertilizerPesticide = isActive;
    const canAddLabor = isActive || isHarvested;
    const canAddHarvest = isActive || isHarvested;
    const canAddFinance = isActive || isHarvested;
    const isReadOnly = isDone;
    const canChangeStatus = isActive || isHarvested;
    const canDelete = true;

    const fetchCrop = async () => {
        try {
            const res = await cropsService.getCrop(id);
            setCrop(res.data);
        }
        catch (error) {
            console.error("Error fetching crop detail:", error);
            toast.error(t('crops.notFound'));
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrop();
    }, [id, t]);

    const refreshCrop = () => {
        fetchCrop();
    };

    const openEditDialog = () => {
        if (crop && canEdit) {
            setEditForm({
                name: crop.name || '',
                name_np: crop.name_np || '',
                variety: crop.variety || '',
                field_name: crop.field_name || '',
                field_area: crop.field_area?.toString() || '',
                area_unit: crop.area_unit || 'ropani',
                planting_date: crop.planting_date || '',
                expected_harvest_date: crop.expected_harvest_date || '',
                growth_stage: crop.growth_stage || 'seeding',
                is_irrigated: crop.is_irrigated || false,
                soil_type: crop.soil_type || '',
                status: crop.status || 'active',
                notes: crop.notes || '',
            });
            setEditErrors({});
            setShowEditDialog(true);
        }
        else {
            toast.error(t('crops.editStatus'));
        }
    };

    const handleStatusChange = async () => {
        if (!newStatus) return;
        setIsSubmitting(true);
        try {
            await cropsService.updateCrop(id, { status: newStatus });
            toast.success(t('common.success'));
            setShowStatusDialog(false);
            await fetchCrop();
        }
        catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const validateName = (name) => {
        if (!name || name.trim() === '') return `${t('crops.cropName')} ${t('common.isRequired')}`;
        if (name.length < 2) return t('crops.tagNumberMinLength') || 'Crop name must be at least 2 characters';
        if (name.length > 100) return 'Crop name must be less than 100 characters';
        return '';
    };

    const validateFieldName = (fieldName) => {
        if (!fieldName || fieldName.trim() === '') return `${t('crops.fieldName')} ${t('common.isRequired')}`;
        if (fieldName.length < 2) return 'Field name must be at least 2 characters';
        if (fieldName.length > 100) return 'Field name must be less than 100 characters';
        return '';
    };

    const validateArea = (area) => {
        if (!area) return `${t('crops.area')} ${t('common.isRequired')}`;
        const numArea = parseFloat(area);
        if (isNaN(numArea)) return 'Please enter a valid number';
        if (numArea <= 0) return 'Area must be greater than 0';
        if (numArea > 10000) return 'Area must be less than 10000';
        return '';
    };

    const validateDate = (date) => {
        if (!date) return `${t('crops.plantingDate')} ${t('common.isRequired')}`;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > today) return t('finance.dateNotFuture') || 'Planting date cannot be in the future';
        if (selectedDate.getFullYear() < 2000) return 'Please enter a valid year';
        return '';
    };

    const handleEditFieldChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
        let error = '';
        if (field === 'name') {
            error = validateName(value);
        }
        else if (field === 'field_name') {
            error = validateFieldName(value);
        }
        else if (field === 'field_area') {
            error = validateArea(value);
        }
        else if (field === 'planting_date') {
            error = validateDate(value);
        }
        setEditErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[field] = error;
            }
            else {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    const validateEditForm = () => {
        const errors = {};
        const nameError = validateName(editForm.name);
        if (nameError) errors.name = nameError;
        const fieldNameError = validateFieldName(editForm.field_name);
        if (fieldNameError) errors.field_name = fieldNameError;
        const areaError = validateArea(editForm.field_area);
        if (areaError) errors.field_area = areaError;
        const dateError = validateDate(editForm.planting_date);
        if (dateError) errors.planting_date = dateError;
        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateCrop = async () => {
        if (!validateEditForm()) {
            toast.error(t('common.error'));
            return;
        }

        setIsSubmitting(true);
        const updateData = {
            name: editForm.name.trim(),
            name_np: editForm.name_np?.trim() || '',
            variety: editForm.variety?.trim() || '',
            field_name: editForm.field_name.trim(),
            field_area: parseFloat(editForm.field_area),
            area_unit: editForm.area_unit,
            planting_date: editForm.planting_date,
            expected_harvest_date: editForm.expected_harvest_date || null,
            growth_stage: editForm.growth_stage,
            is_irrigated: editForm.is_irrigated,
            soil_type: editForm.soil_type || '',
            status: editForm.status,
            notes: editForm.notes || '',
        };

        try {
            await cropsService.updateCrop(id, updateData);
            toast.success(t('common.success'));
            setShowEditDialog(false);
            await fetchCrop();
        }
        catch (error) {
            console.error('Error updating crop:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCrop = async () => {
        setIsSubmitting(true);
        try {
            await cropsService.deleteCrop(id);
            toast.success(t('common.success'));
            navigate('/crops');
        }
        catch (error) {
            console.error('Error deleting crop:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const hasErrors = Object.keys(editErrors).length > 0;

    const getStatusIcon = () => {
        if (isActive) return <Sprout className="w-4 h-4"/>;
        if (isHarvested) return <Wheat className="w-4 h-4"/>;
        return <Archive className="w-4 h-4"/>;
    };

    const getStatusMessage = () => {
        if (isActive) return t('crops.statusActive');
        if (isHarvested) return t('crops.statusHarvested');
        return t('crops.statusFailed');
    };

    const getStatusBadgeClass = () => {
        if (isActive) return 'bg-green-100 text-green-700';
        if (isHarvested) return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-600';
    };

    // Get growth stage display with lock indicator
    const getGrowthStageDisplay = () => {
        if (isGrowthStageLocked) {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold capitalize">{crop.growth_stage}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                        <Lock className="w-3 h-3" />
                        Manual
                    </span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold capitalize">{crop.growth_stage}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    <RefreshCw className="w-3 h-3" />
                    Auto
                </span>
            </div>
        );
    };

    if (loading) return (
        <MainLayout title={t('crops.detailTitle')} subtitle="...">
            <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl"/>
                <Skeleton className="h-64 w-full rounded-2xl"/>
            </div>
        </MainLayout>
    );

    if (!crop) return (
        <MainLayout title={t('crops.detailTitle')} subtitle="Not Found">
            <div className="text-center py-20">
                <p>{t('crops.notFound')}</p>
                <Button onClick={() => navigate('/crops')} className="mt-4">{t('common.back')}</Button>
            </div>
        </MainLayout>
    );

    return (
        <MainLayout title={language === 'np' && crop.name_np ? crop.name_np : crop.name} subtitle={crop.variety || t('crops.localVariety')}>
            <div className="space-y-4 sm:space-y-6">
                {/* Header with Actions */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <Button variant="ghost" onClick={() => navigate('/crops')} className="rounded-xl gap-2 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4"/> {t('common.backToCrops')}
                    </Button>
                    
                    <div className="flex gap-2">
                        {/* Status Badge - Inline icon and text */}
                        <div className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 ${getStatusBadgeClass()}`}>
                            {getStatusIcon()}
                            <span className="capitalize">{crop.status}</span>
                        </div>
                        
                        {/* Edit Button - Only for active crops */}
                        {canEdit && (
                            <Button variant="outline" size="sm" onClick={openEditDialog} className="rounded-xl gap-2">
                                <Edit2 className="w-4 h-4"/> {t('common.edit')}
                            </Button>
                        )}
                        
                        {/* Status Change Button */}
                        {canChangeStatus && (
                            <Button variant="outline" size="sm" onClick={() => {
                                setNewStatus(isActive ? 'harvested' : 'done');
                                setShowStatusDialog(true);
                            }} className="rounded-xl gap-2">
                                <RefreshCw className="w-4 h-4"/> 
                                {isActive ? t('crops.markAsHarvested') : t('common.markAsDone')}
                            </Button>
                        )}
                        
                        {/* Delete Button */}
                        {canDelete && (
                            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="rounded-xl gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4"/> {t('common.delete')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Info Banner */}
                <div className={`p-4 rounded-xl ${isActive ? 'bg-green-50 border border-green-100' :
                    isHarvested ? 'bg-blue-50 border border-blue-100' :
                    'bg-gray-50 border border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <p className="text-sm text-gray-700">{getStatusMessage()}</p>
                    </div>
                </div>

                {/* Growth Stage Lock Warning Banner - Show when manual override is active */}
                {isGrowthStageLocked && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">
                                    {t('crops.growthStageManualOverride') || 'Growth stage is manually set'}
                                </p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    {t('crops.growthStageManualOverrideMessage') || 
                                    'Auto-calculation is disabled. The growth stage will not change automatically.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hero Section Card */}
                <div className="farm-card p-0 overflow-hidden border-0 shadow-xl">
                    <div className="bg-linear-to-br from-green-700 to-green-900 p-6 sm:p-10 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wheat className="w-48 h-48 sm:w-64 sm:h-64"/>
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                                {language === 'np' && crop.name_np ? crop.name_np : crop.name}
                            </h1>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('crops.fieldName')}</p>
                                        <p className="text-lg sm:text-xl font-bold">{crop.field_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wheat className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('crops.area')}</p>
                                        <p className="text-lg sm:text-xl font-bold">{crop.field_area} {crop.area_unit}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('crops.plantingDate')}</p>
                                        <p className="text-lg sm:text-xl font-bold">{new Date(crop.planting_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sprout className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('crops.growthStage')}</p>
                                        {getGrowthStageDisplay()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section - Full Width Grid */}
                <div className="w-full">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <div className="w-full">
                            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2">
                                <TabsTrigger value="overview" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                                    {t('crops.tabOverview')}
                                </TabsTrigger>
                                <TabsTrigger value="finance" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                                    {t('crops.tabFinance')}
                                </TabsTrigger>
                                <TabsTrigger value="fertilizer" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                                    {t('crops.tabFertilizer')}
                                </TabsTrigger>
                                <TabsTrigger value="pesticide" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                                    {t('crops.tabPesticide')}
                                </TabsTrigger>
                                <TabsTrigger value="labor" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                                    {t('crops.tabLabor')}
                                </TabsTrigger>
                                <TabsTrigger value="harvest" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                                    {t('crops.tabHarvest')}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview">
                            <OverviewTab crop={crop} />
                        </TabsContent>

                        <TabsContent value="finance">
                            <FinanceTab crop={crop} onRefresh={refreshCrop} isReadOnly={isReadOnly} canAdd={canAddFinance} />
                        </TabsContent>

                        <TabsContent value="fertilizer">
                            <FertilizerTab crop={crop} onRefresh={refreshCrop} isReadOnly={isReadOnly || isHarvested} canAdd={canAddFertilizerPesticide} />
                        </TabsContent>

                        <TabsContent value="pesticide">
                            <PesticideTab crop={crop} onRefresh={refreshCrop} isReadOnly={isReadOnly || isHarvested} canAdd={canAddFertilizerPesticide} />
                        </TabsContent>

                        <TabsContent value="labor">
                            <LaborTab crop={crop} onRefresh={refreshCrop} isReadOnly={isReadOnly} canAdd={canAddLabor} />
                        </TabsContent>

                        <TabsContent value="harvest">
                            <HarvestTab crop={crop} onRefresh={refreshCrop} isReadOnly={isReadOnly} canAdd={canAddHarvest} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Status Change Dialog */}
            <ResponsiveDialog isOpen={showStatusDialog} onClose={() => setShowStatusDialog(false)} title={t('common.changeStatus')} maxWidth="sm">
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                            {newStatus === 'harvested' ? <Wheat className="h-6 w-6 text-blue-600"/> : <Archive className="h-6 w-6 text-gray-600"/>}
                        </div>
                        <p className="text-gray-600 mb-4">
                            {newStatus === 'harvested' ? t('crops.harvestedConfirmation') : t('crops.doneConfirmation')}
                        </p>
                        {newStatus === 'harvested' && (
                            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                ⚠️ {t('crops.harvestedWarning')}
                            </p>
                        )}
                        {newStatus === 'done' && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                📄 {t('crops.doneWarning')}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleStatusChange} disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700">
                            {isSubmitting ? t('common.saving') : (newStatus === 'harvested' ? t('crops.markAsHarvested') : t('common.markAsDone'))}
                        </Button>
                        <Button variant="outline" onClick={() => setShowStatusDialog(false)} className="flex-1">
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </ResponsiveDialog>

            {/* Edit Crop Dialog */}
            <ResponsiveDialog isOpen={showEditDialog} onClose={() => { setShowEditDialog(false); setEditErrors({}); }} title={`${t('common.edit')} ${t('crops.title')}`} maxWidth="md">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                    {/* Crop Name (EN) */}
                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {t('crops.cropNameEn')} *
                        </Label>
                        <Input value={editForm.name} onChange={e => handleEditFieldChange('name', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`} placeholder="Enter crop name"/>
                        {editErrors.name && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3"/> {editErrors.name}
                            </p>
                        )}
                    </div>
                    
                    {/* Crop Name (NP) */}
                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {t('crops.cropNameNp')}
                        </Label>
                        <Input value={editForm.name_np} onChange={e => handleEditFieldChange('name_np', e.target.value)} className="rounded-xl h-11 sm:h-12 border-gray-300 focus:ring-green-500" placeholder="नेपालीमा बालीको नाम"/>
                    </div>
                    
                    {/* Variety */}
                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {t('crops.variety')}
                        </Label>
                        <Input value={editForm.variety} onChange={e => handleEditFieldChange('variety', e.target.value)} className="rounded-xl h-11 sm:h-12 border-gray-300 focus:ring-green-500" placeholder="e.g., Basmati, Hybrid"/>
                    </div>
                    
                    {/* Field Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {t('crops.fieldName')} *
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input value={editForm.field_name} onChange={e => handleEditFieldChange('field_name', e.target.value)} className={`rounded-xl h-11 sm:h-12 pl-10 ${editErrors.field_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`} placeholder="North Field"/>
                        </div>
                        {editErrors.field_name && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3"/> {editErrors.field_name}
                            </p>
                        )}
                    </div>
                    
                    {/* Area and Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {t('crops.area')} *
                            </Label>
                            <Input type="number" step="0.01" value={editForm.field_area} onChange={e => handleEditFieldChange('field_area', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.field_area ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`} placeholder="10.5"/>
                            {editErrors.field_area && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3"/> {editErrors.field_area}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {t('crops.unit')}
                            </Label>
                            <Select value={editForm.area_unit} onValueChange={v => handleEditFieldChange('area_unit', v)}>
                                <SelectTrigger className="rounded-xl h-11 sm:h-12 border-gray-300 focus:ring-green-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ropani">{t('crops.ropani')}</SelectItem>
                                    <SelectItem value="bigha">{t('crops.bigha')}</SelectItem>
                                    <SelectItem value="kattha">{t('crops.kattha')}</SelectItem>
                                    <SelectItem value="hectare">Hectare</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {/* Planting Date and Expected Harvest */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {t('crops.plantingDate')} *
                            </Label>
                            <Input type="date" value={editForm.planting_date} onChange={e => handleEditFieldChange('planting_date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.planting_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}/>
                            {editErrors.planting_date && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3"/> {editErrors.planting_date}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {t('crops.expectedHarvest')}
                            </Label>
                            <Input type="date" value={editForm.expected_harvest_date} onChange={e => handleEditFieldChange('expected_harvest_date', e.target.value)} className="rounded-xl h-11 sm:h-12 border-gray-300 focus:ring-green-500"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {t('crops.growthStage')}
                            </Label>
                            <Select value={editForm.growth_stage} onValueChange={v => handleEditFieldChange('growth_stage', v)}>
                                <SelectTrigger className="rounded-xl h-11 sm:h-12 border-gray-300 focus:ring-green-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="seeding">{t('crops.stageSeeding')}</SelectItem>
                                    <SelectItem value="vegetative">{t('crops.stageVegetative')}</SelectItem>
                                    <SelectItem value="flowering">{t('crops.stageFlowering')}</SelectItem>
                                    <SelectItem value="fruiting">{t('crops.stageFruiting')}</SelectItem>
                                    <SelectItem value="harvest">{t('crops.stageHarvest')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Show warning when editing growth stage in dialog */}
                            {isGrowthStageLocked && (
                                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                    <Lock className="w-3 h-3"/>
                                    {t('crops.growthStageManualOverrideWarning') || 'Changing this will permanently disable auto-calculation'}
                                </p>
                            )}
                            {!isGrowthStageLocked && (
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                    <RefreshCw className="w-3 h-3"/>
                                    {t('crops.growthStageAutoMode') || 'Auto-calculation is active'}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {t('crops.status')}
                            </Label>
                            <div className="relative">
                                <Select value={editForm.status} disabled>
                                    <SelectTrigger className="rounded-xl h-11 sm:h-12 border-gray-300 bg-gray-50 cursor-not-allowed opacity-75">
                                        <SelectValue />
                                    </SelectTrigger>
                                </Select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground"/>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Info className="w-3 h-3"/>
                                {t('crops.editStatus')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Soil Type */}
                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {t('crops.soilType')}
                        </Label>
                        <div className="relative">
                            <Mountain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Select value={editForm.soil_type} onValueChange={v => handleEditFieldChange('soil_type', v)}>
                                <SelectTrigger className="rounded-xl h-11 sm:h-12 pl-10 border-gray-300 focus:ring-green-500">
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
                    
                    {/* Irrigation Checkbox */}
                    <div className="space-y-1.5 flex items-center">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={editForm.is_irrigated} onChange={e => handleEditFieldChange('is_irrigated', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"/>
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Droplets className="h-4 w-4"/>
                                {t('crops.irrigated')}
                            </span>
                        </label>
                    </div>
                    
                    {/* Notes */}
                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {t('crops.notes')}
                        </Label>
                        <Textarea value={editForm.notes} onChange={e => handleEditFieldChange('notes', e.target.value)} className="rounded-xl resize-none border-gray-300 focus:ring-green-500" rows={3} placeholder={t('common.notesPlaceholder')}/>
                    </div>
                    
                    {/* Form Validation Summary */}
                    {hasErrors && (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-xs text-yellow-800 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3"/>
                                {t('common.error')}
                            </p>
                        </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button onClick={handleUpdateCrop} disabled={isSubmitting || hasErrors} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
                            {isSubmitting ? t('common.saving') : t('common.save')}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditErrors({}); }} className="w-full sm:flex-1">
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </ResponsiveDialog>

            {/* Delete Confirmation Dialog */}
            <ResponsiveDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={t('common.delete')} maxWidth="sm">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600"/>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        {t('common.deleteConfirmation')}
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={handleDeleteCrop} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
                            {isSubmitting ? t('common.saving') : t('common.delete')}
                        </Button>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </ResponsiveDialog>
        </MainLayout>
    );
};

export default CropDetailPage;