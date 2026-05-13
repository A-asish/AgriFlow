import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Beef, Calendar, Tag, Info, ChevronLeft, HeartPulse, DollarSign, Edit2, Trash2, RefreshCw, Archive, AlertCircle, CalendarDays } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { livestockService } from '@/features/farmer/livestock/services/livestock.api';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { OverviewTab } from '../components/tabs/OverviewTab';
import { HealthTab } from '../components/tabs/HealthTab';
import { MilkTab } from '../components/tabs/MilkTab';
import { VaccinationTab } from '../components/tabs/VaccinationTab';
import { BreedingTab } from '../components/tabs/BreedingTab';
import { FinanceTab } from '../components/tabs/FinanceTab';
const LivestockDetailPage = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    // Edit form state with all fields
    const [editForm, setEditForm] = useState({
        name: '',
        tag_number: '',
        gender: 'female',
        birth_date: '',
        acquisition_date: '',
        acquisition_cost: '',
        notes: ''
    });
    const [editErrors, setEditErrors] = useState({});
    // Status-based access control
    const isActive = animal?.status === 'active';
    const isSold = animal?.status === 'sold';
    const isDead = animal?.status === 'dead';
    const isButchered = animal?.status === 'butchered';
    const canChangeStatus = isActive;
    const isReadOnly = !isActive;
    const isFemale = animal?.gender === 'female';
    const fetchAnimal = async () => {
        try {
            const res = await livestockService.getAnimal(id);
            setAnimal(res.data);
        }
        catch (error) {
            console.error("Error fetching animal detail:", error);
            toast.error(t('livestock.notFound'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAnimal();
    }, [id, t, refreshKey]);
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        fetchAnimal();
    };
    // Open edit dialog with all animal data
    const openEditDialog = () => {
        if (animal && isActive) {
            setEditForm({
                name: animal.name || '',
                tag_number: animal.tag_number || '',
                gender: animal.gender || 'female',
                birth_date: animal.birth_date || '',
                acquisition_date: animal.acquisition_date || '',
                acquisition_cost: animal.acquisition_cost?.toString() || '',
                notes: animal.notes || ''
            });
            setEditErrors({});
            setShowEditDialog(true);
        }
        else {
            toast.error(t('livestock.addError'));
        }
    };
    // Validation functions
    const validateName = (name) => {
        if (name && name.length > 100)
            return t('livestock.tagNumberMinLength');
        return '';
    };
    const validateTagNumber = (tag) => {
        if (!tag || tag.trim() === '')
            return `${t('livestock.tagId')} ${t('common.isRequired')}`;
        if (tag.length < 2)
            return t('livestock.tagNumberMinLength');
        if (tag.length > 50)
            return t('livestock.tagNumberMinLength');
        return '';
    };
    const validateDate = (date) => {
        if (!date)
            return '';
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > today)
            return t('finance.dateNotFuture') || 'Date cannot be in the future';
        return '';
    };
    const validateAcquisitionCost = (cost) => {
        if (!cost)
            return '';
        const numCost = parseFloat(cost);
        if (isNaN(numCost))
            return t('livestock.acquisitionCostNegative');
        if (numCost < 0)
            return t('livestock.acquisitionCostNegative');
        if (numCost > 10000000)
            return t('finance.amountMax');
        return '';
    };
    const handleEditFieldChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
        let error = '';
        if (field === 'name') {
            error = validateName(value);
        }
        else if (field === 'tag_number') {
            error = validateTagNumber(value);
        }
        else if (field === 'birth_date') {
            error = validateDate(value);
        }
        else if (field === 'acquisition_date') {
            error = validateDate(value);
        }
        else if (field === 'acquisition_cost') {
            error = validateAcquisitionCost(value);
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
        const tagError = validateTagNumber(editForm.tag_number);
        if (tagError)
            errors.tag_number = tagError;
        const nameError = validateName(editForm.name);
        if (nameError)
            errors.name = nameError;
        const birthDateError = validateDate(editForm.birth_date);
        if (birthDateError)
            errors.birth_date = birthDateError;
        const acquisitionDateError = validateDate(editForm.acquisition_date);
        if (acquisitionDateError)
            errors.acquisition_date = acquisitionDateError;
        const costError = validateAcquisitionCost(editForm.acquisition_cost);
        if (costError)
            errors.acquisition_cost = costError;
        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };
    // Handle update with all fields
    const handleUpdateAnimal = async () => {
        if (!validateEditForm()) {
            toast.error(t('common.error'));
            return;
        }
        setIsSubmitting(true);
        const updateData = {
            name: editForm.name.trim(),
            tag_number: editForm.tag_number.trim(),
            gender: editForm.gender,
            birth_date: editForm.birth_date || null,
            acquisition_date: editForm.acquisition_date || null,
            acquisition_cost: editForm.acquisition_cost ? parseFloat(editForm.acquisition_cost) : 0,
            notes: editForm.notes || '',
        };
        try {
            await livestockService.updateAnimal(id, updateData);
            toast.success(t('common.success'));
            setShowEditDialog(false);
            await fetchAnimal();
        }
        catch (error) {
            console.error('Error updating animal:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleStatusChange = async () => {
        if (!selectedStatus)
            return;
        setIsSubmitting(true);
        try {
            await livestockService.updateAnimal(id, { status: selectedStatus });
            toast.success(t('common.success'));
            setShowStatusDialog(false);
            setSelectedStatus('');
            await fetchAnimal();
        }
        catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteAnimal = async () => {
        setIsSubmitting(true);
        try {
            await livestockService.deleteAnimal(id);
            toast.success(t('common.success'));
            navigate('/livestock');
        }
        catch (error) {
            console.error('Error deleting animal:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
        finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };
    const getStatusIcon = () => {
        if (isActive)
            return <HeartPulse className="w-4 h-4"/>;
        if (isSold)
            return <DollarSign className="w-4 h-4"/>;
        if (isDead)
            return <AlertCircle className="w-4 h-4"/>;
        if (isButchered)
            return <Archive className="w-4 h-4"/>;
        return <Info className="w-4 h-4"/>;
    };
    const getStatusMessage = () => {
        if (isActive)
            return t('livestock.statusActive');
        if (isSold)
            return t('livestock.statusSold');
        if (isDead)
            return t('livestock.statusDead');
        if (isButchered)
            return t('livestock.statusButchered');
        return "";
    };
    const getStatusBadgeClass = () => {
        if (isActive)
            return 'bg-green-100 text-green-700';
        if (isSold)
            return 'bg-gray-100 text-gray-700';
        if (isDead)
            return 'bg-red-100 text-red-700';
        if (isButchered)
            return 'bg-orange-100 text-orange-700';
        return 'bg-gray-100 text-gray-700';
    };
    const getStatusOptions = () => {
        const options = [];
        if (isActive) {
            options.push({ value: 'sold', label: t('livestock.statusSold') });
            options.push({ value: 'dead', label: t('livestock.statusDead') });
            options.push({ value: 'butchered', label: t('livestock.statusButchered') });
        }
        return options;
    };
    const hasEditErrors = Object.keys(editErrors).length > 0;
    if (loading)
        return (<MainLayout title={t('livestock.detailTitle')} subtitle="...">
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl"/>
        <Skeleton className="h-64 w-full rounded-2xl"/>
      </div>
    </MainLayout>);
    if (!animal)
        return (<MainLayout title={t('livestock.detailTitle')} subtitle="Not Found">
      <div className="text-center py-20">
        <p>{t('livestock.notFound')}</p>
        <Button onClick={() => navigate('/livestock')} className="mt-4">{t('common.back')}</Button>
      </div>
    </MainLayout>);
    return (<MainLayout title={`${animal.animal_type_name} ${animal.tag_number}`} subtitle={animal.name || t('livestock.localBreed')}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" onClick={() => navigate('/livestock')} className="rounded-xl gap-2 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4"/> {t('common.backToLivestock')}
          </Button>
          
          <div className="flex gap-2">
            {/* Status Badge - Inline icon and text */}
            <div className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 ${getStatusBadgeClass()}`}>
              {getStatusIcon()}
              <span className="capitalize">{animal.status}</span>
            </div>
            
            {/* Edit Button - Only for active animals */}
            {isActive && (<Button variant="outline" size="sm" onClick={openEditDialog} className="rounded-xl gap-2">
                <Edit2 className="w-4 h-4"/> {t('common.edit')}
              </Button>)}
            
            {/* Status Change Button - Only for active animals */}
            {canChangeStatus && (<Button variant="outline" size="sm" onClick={() => setShowStatusDialog(true)} className="rounded-xl gap-2">
                <RefreshCw className="w-4 h-4"/> 
                {t('common.changeStatus')}
              </Button>)}
            
            {/* Delete Button */}
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="rounded-xl gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4"/> {t('common.delete')}
            </Button>
          </div>
        </div>

        {/* Status Info Banner */}
        {!isActive && (<div className={`p-4 rounded-xl ${isSold ? 'bg-gray-50 border border-gray-100' :
                isDead ? 'bg-red-50 border border-red-100' :
                    isButchered ? 'bg-orange-50 border border-orange-100' :
                        'bg-gray-50 border border-gray-100'}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <p className="text-sm text-gray-700">{getStatusMessage()}</p>
            </div>
          </div>)}

        {/* Hero Section Card */}
        <div className="farm-card p-0 overflow-hidden border-0 shadow-xl">
          <div className="bg-linear-to-br from-amber-700 to-amber-900 p-6 sm:p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Beef className="w-48 h-48 sm:w-64 sm:h-64"/>
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                {language === 'np' && animal.animal_type_name_np ? animal.animal_type_name_np : animal.animal_type_name}
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 opacity-70"/>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('livestock.tagId')}</p>
                    <p className="text-lg sm:text-xl font-bold">{animal.tag_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 opacity-70"/>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('livestock.gender')}</p>
                    <p className="text-lg sm:text-xl font-bold capitalize">{animal.gender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 opacity-70"/>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('livestock.age')}</p>
                    <p className="text-lg sm:text-xl font-bold">
                      {animal.birth_date ? `${new Date().getFullYear() - new Date(animal.birth_date).getFullYear()} yrs` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 opacity-70"/>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{t('common.status')}</p>
                    <p className="text-lg sm:text-xl font-bold capitalize">{animal.status}</p>
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
                  {t('livestock.tabOverview')}
                </TabsTrigger>
                <TabsTrigger value="health" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                  {t('livestock.tabHealth')}
                </TabsTrigger>
                {isFemale && (<TabsTrigger value="milk" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                    {t('livestock.tabMilk')}
                  </TabsTrigger>)}
                {isFemale && (<TabsTrigger value="breeding" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                    {t('livestock.tabBreeding')}
                  </TabsTrigger>)}
                <TabsTrigger value="vaccine" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                  {t('livestock.tabVaccine')}
                </TabsTrigger>
                <TabsTrigger value="finance" className="py-3 px-4 rounded-xl text-sm sm:text-base font-bold">
                  {t('livestock.tabFinance')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <OverviewTab animal={animal}/>
            </TabsContent>

            <TabsContent value="health">
              <HealthTab animal={animal} onRefresh={handleRefresh} isReadOnly={isReadOnly}/>
            </TabsContent>

            {isFemale && (<TabsContent value="milk">
                <MilkTab animal={animal} onRefresh={handleRefresh} isReadOnly={isReadOnly}/>
              </TabsContent>)}

            {isFemale && (<TabsContent value="breeding">
                <BreedingTab animal={animal} onRefresh={handleRefresh} isReadOnly={isReadOnly}/>
              </TabsContent>)}

            <TabsContent value="vaccine">
              <VaccinationTab animal={animal} onRefresh={handleRefresh} isReadOnly={isReadOnly}/>
            </TabsContent>

            <TabsContent value="finance">
              <FinanceTab animal={animal} onRefresh={handleRefresh} isReadOnly={isReadOnly}/>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Animal Dialog with All Fields */}
      <ResponsiveDialog isOpen={showEditDialog} onClose={() => { setShowEditDialog(false); setEditErrors({}); }} title={`${t('common.edit')} ${t('livestock.title')}`} maxWidth="md">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {/* Tag Number - Required */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('livestock.tagId')} *
            </Label>
            <Input value={editForm.tag_number} onChange={e => handleEditFieldChange('tag_number', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.tag_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`} placeholder="COW-001"/>
            {editErrors.tag_number && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {editErrors.tag_number}
              </p>)}
          </div>
          
          {/* Name - Optional */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('livestock.name')}
            </Label>
            <Input value={editForm.name} onChange={e => handleEditFieldChange('name', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`} placeholder={t('livestock.namePlaceholder')}/>
            {editErrors.name && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {editErrors.name}
              </p>)}
          </div>
          
          {/* Gender - Required */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('livestock.gender')} *
            </Label>
            <Select value={editForm.gender} onValueChange={v => handleEditFieldChange('gender', v)}>
              <SelectTrigger className="rounded-xl h-11 sm:h-12 border-gray-300 focus:ring-amber-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('livestock.genderMale')}</SelectItem>
                <SelectItem value="female">{t('livestock.genderFemale')}</SelectItem>
                <SelectItem value="unknown">{t('livestock.genderUnknown')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Birth Date - Optional */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3 h-3 inline mr-1"/> {t('livestock.birthDate')}
            </Label>
            <Input type="date" value={editForm.birth_date} onChange={e => handleEditFieldChange('birth_date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.birth_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`}/>
            {editErrors.birth_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {editErrors.birth_date}
              </p>)}
          </div>

          {/* Acquisition Date - Optional */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <CalendarDays className="w-3 h-3 inline mr-1"/> {t('livestock.acquisitionDate')}
            </Label>
            <Input type="date" value={editForm.acquisition_date} onChange={e => handleEditFieldChange('acquisition_date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.acquisition_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`}/>
            {editErrors.acquisition_date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {editErrors.acquisition_date}
              </p>)}
          </div>

          {/* Acquisition Cost - Optional */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <DollarSign className="w-3 h-3 inline mr-1"/> {t('livestock.acquisitionCost')} ({t('common.rs')})
            </Label>
            <Input type="number" step="0.01" value={editForm.acquisition_cost} onChange={e => handleEditFieldChange('acquisition_cost', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${editErrors.acquisition_cost ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'}`} placeholder={t('livestock.acquisitionCostPlaceholder')}/>
            {editErrors.acquisition_cost && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {editErrors.acquisition_cost}
              </p>)}
          </div>
          
          {/* Notes - Optional */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.notes')}
            </Label>
            <Textarea value={editForm.notes} onChange={e => handleEditFieldChange('notes', e.target.value)} className="rounded-xl resize-none border-gray-300 focus:ring-amber-500" rows={3} placeholder={t('common.notesPlaceholder')}/>
          </div>
          
          {/* Form Validation Summary */}
          {hasEditErrors && (<div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3"/>
                {t('common.error')}
              </p>
            </div>)}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleUpdateAnimal} disabled={isSubmitting || hasEditErrors} className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400">
              {isSubmitting ? t('common.saving') : t('common.save')}
            </Button>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditErrors({}); }} className="w-full sm:flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Status Change Dialog with Dropdown */}
      <ResponsiveDialog isOpen={showStatusDialog} onClose={() => { setShowStatusDialog(false); setSelectedStatus(''); }} title={t('common.changeStatus')} maxWidth="sm">
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <RefreshCw className="h-6 w-6 text-gray-600"/>
            </div>
            <p className="text-gray-600 mb-4">
              {t('livestock.currentStatus')}:
            </p>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder={t('finance.selectCategory')}/>
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map(option => (<SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>))}
              </SelectContent>
            </Select>

            {selectedStatus === 'sold' && (<p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mt-4">
                ⚠️ {t('livestock.statusSold')}
              </p>)}
            {selectedStatus === 'dead' && (<p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                ⚠️ {t('livestock.statusDead')}
              </p>)}
            {selectedStatus === 'butchered' && (<p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg mt-4">
                ⚠️ {t('livestock.statusButchered')}
              </p>)}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleStatusChange} disabled={isSubmitting || !selectedStatus} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {isSubmitting ? t('common.saving') : t('common.save')}
            </Button>
            <Button variant="outline" onClick={() => { setShowStatusDialog(false); setSelectedStatus(''); }} className="flex-1">
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
            <Button onClick={handleDeleteAnimal} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
              {isSubmitting ? t('common.saving') : t('common.delete')}
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </MainLayout>);
};
export default LivestockDetailPage;
