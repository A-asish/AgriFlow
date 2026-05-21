import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Beef, Calendar, Tag, Info } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { livestockService } from '../services/livestock.api';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';

// Components
import LivestockHeader from '../components/LivestockHeader';
import LivestockEditForm from '../components/LivestockEditForm';
import StatusChangeDialog from '../components/statusChangeDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { OverviewTab } from '../components/tabs/OverviewTab';
import { HealthTab } from '../components/tabs/HealthTab';
import { MilkTab } from '../components/tabs/MilkTab';
import { VaccinationTab } from '../components/tabs/VaccinationTab';
import { BreedingTab } from '../components/tabs/BreedingTab';
import { FinanceTab } from '../components/tabs/FinanceTab';

const LivestockDetailPage = () => {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Dialog states
    const [showEditForm, setShowEditForm] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const fetchAnimal = async () => {
        try {
            const res = await livestockService.getAnimal(id);
            setAnimal(res.data);
        } catch (error) {
            console.error("Error:", error);
            toast.error(t('livestock.notFound'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnimal();
    }, [id, refreshKey]);

    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    const isActive = animal?.status === 'active';
    const isFemale = animal?.gender === 'female';

    if (loading) {
        return (
            <MainLayout title={t('livestock.detailTitle')} subtitle="...">
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl"/>
                    <Skeleton className="h-64 w-full rounded-2xl"/>
                </div>
            </MainLayout>
        );
    }

    if (!animal) {
        return (
            <MainLayout title={t('livestock.detailTitle')} subtitle="Not Found">
                <div className="text-center py-20">
                    <p>{t('livestock.notFound')}</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={`${animal.animal_type_name} ${animal.tag_number}`} subtitle={animal.name || t('livestock.localBreed')}>
            <div className="space-y-6">
                {/* Header with Actions */}
                <LivestockHeader 
                    animal={animal}
                    isActive={isActive}
                    onEdit={() => setShowEditForm(true)}
                    onStatusChange={() => setShowStatusDialog(true)}
                    onDelete={() => setShowDeleteDialog(true)}
                />

                {/* Hero Section */}
                <div className="farm-card p-0 overflow-hidden border-0 shadow-xl">
                    <div className="bg-linear-to-br from-amber-700 to-amber-900 p-6 sm:p-10 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Beef className="w-48 h-48 sm:w-64 sm:h-64"/>
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-3xl sm:text-5xl font-extrabold mb-6">
                                {language === 'np' && animal.animal_type_name_np ? animal.animal_type_name_np : animal.animal_type_name}
                            </h1>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-xs font-bold uppercase opacity-70">{t('livestock.tagId')}</p>
                                        <p className="text-xl font-bold">{animal.tag_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-xs font-bold uppercase opacity-70">{t('livestock.gender')}</p>
                                        <p className="text-xl font-bold capitalize">{animal.gender}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-xs font-bold uppercase opacity-70">{t('livestock.age')}</p>
                                        <p className="text-xl font-bold">
                                            {animal.birth_date ? `${new Date().getFullYear() - new Date(animal.birth_date).getFullYear()} yrs` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Beef className="w-4 h-4 opacity-70"/>
                                    <div>
                                        <p className="text-xs font-bold uppercase opacity-70">{t('common.status')}</p>
                                        <p className="text-xl font-bold capitalize">{animal.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2">
                        <TabsTrigger value="overview">{t('livestock.tabOverview')}</TabsTrigger>
                        <TabsTrigger value="health">{t('livestock.tabHealth')}</TabsTrigger>
                        {isFemale && <TabsTrigger value="milk">{t('livestock.tabMilk')}</TabsTrigger>}
                        {isFemale && <TabsTrigger value="breeding">{t('livestock.tabBreeding')}</TabsTrigger>}
                        <TabsTrigger value="vaccine">{t('livestock.tabVaccine')}</TabsTrigger>
                        <TabsTrigger value="finance">{t('livestock.tabFinance')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview"><OverviewTab animal={animal}/></TabsContent>
                    <TabsContent value="health"><HealthTab animal={animal} onRefresh={handleRefresh} isReadOnly={!isActive}/></TabsContent>
                    {isFemale && <TabsContent value="milk"><MilkTab animal={animal} onRefresh={handleRefresh} isReadOnly={!isActive}/></TabsContent>}
                    {isFemale && <TabsContent value="breeding"><BreedingTab animal={animal} onRefresh={handleRefresh} isReadOnly={!isActive}/></TabsContent>}
                    <TabsContent value="vaccine"><VaccinationTab animal={animal} onRefresh={handleRefresh} isReadOnly={!isActive}/></TabsContent>
                    <TabsContent value="finance"><FinanceTab animal={animal} onRefresh={handleRefresh} isReadOnly={!isActive}/></TabsContent>
                </Tabs>
            </div>

            {/* Dialogs */}
            <LivestockEditForm 
                animal={animal}
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                onRefresh={handleRefresh}
            />
            
            <StatusChangeDialog 
                animal={animal}
                isOpen={showStatusDialog}
                onClose={() => setShowStatusDialog(false)}
                onRefresh={handleRefresh}
            />
            
            <DeleteConfirmDialog 
                animal={animal}
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
            />
        </MainLayout>
    );
};

export default LivestockDetailPage;