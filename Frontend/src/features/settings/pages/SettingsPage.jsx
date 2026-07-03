// src/features/settings/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/features/auth/services/auth.api';
import { getApiErrorMessage } from '@/shared/utils/apiError';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import ProfileTab from '../components/ProfileTab';
import PreferencesTab from '../components/PreferencesTab';
import SecurityTab from '../components/SecurityTab';

const SettingsPage = () => {
    const { t, language, setLanguage } = useLanguage();
    const { user, loading: authLoading, isAuthenticated, refreshProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        location: '',
        district: '',
        geographical_region: '',
        farm_name: '',
        total_farm_area: '',
        farm_village: '',
        farm_municipality: '',
        farm_district: '',
        farm_province: '',
        farm_ward_number: '',
        farm_altitude: '',
        farm_soil_type: '',
        water_source: '',
    });

    useEffect(() => {
        if (!user) return;
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            location: user.location || '',
            district: user.district || '',
            geographical_region: user.geographical_region || '',
            farm_name: user.farm_name || '',
            total_farm_area: user.total_farm_area ?? '',
            farm_village: user.farm_village || '',
            farm_municipality: user.farm_municipality || '',
            farm_district: user.farm_district || '',
            farm_province: user.farm_province || '',
            farm_ward_number: user.farm_ward_number ?? '',
            farm_altitude: user.farm_altitude ?? '',
            farm_soil_type: user.farm_soil_type || '',
            water_source: user.water_source || '',
        });
    }, [user]);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                location: formData.location,
                district: formData.district,
                geographical_region: formData.geographical_region || null,
                farm_name: formData.farm_name,
                total_farm_area: formData.total_farm_area ? parseFloat(formData.total_farm_area) : null,
                farm_village: formData.farm_village,
                farm_municipality: formData.farm_municipality,
                farm_district: formData.farm_district,
                farm_province: formData.farm_province,
                farm_ward_number: formData.farm_ward_number ? parseInt(formData.farm_ward_number, 10) : null,
                farm_altitude: formData.farm_altitude ? parseFloat(formData.farm_altitude) : null,
                farm_soil_type: formData.farm_soil_type || null,
                water_source: formData.water_source || null,
            };

            await authService.updateProfile(user.id, updateData);
            await refreshProfile();
            toast.success(t('settings.profileUpdated'));
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('common.error')));
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <MainLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
                <div className="max-w-5xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-full max-w-md rounded-xl" />
                    <Skeleton className="h-96 rounded-3xl" />
                </div>
            </MainLayout>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <MainLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">{t('dashboard.loginToView')}</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
            <div className="max-w-5xl mx-auto space-y-6">
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid grid-cols-3 w-full max-w-lg bg-slate-100 rounded-xl p-1">
                        <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white">
                            {t('settings.profile')}
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-white">
                            {t('settings.preferences')}
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white">
                            {t('settings.security')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <ProfileTab
                            user={user}
                            formData={formData}
                            saving={saving}
                            uploadingPhoto={uploadingPhoto}
                            setUploadingPhoto={setUploadingPhoto}
                            handleInputChange={handleInputChange}
                            handleSelectChange={handleSelectChange}
                            handleSubmit={handleSubmit}
                            refreshProfile={refreshProfile}
                        />
                    </TabsContent>

                    <TabsContent value="preferences">
                        <PreferencesTab language={language} setLanguage={setLanguage} user={user} />
                    </TabsContent>

                    <TabsContent value="security">
                        <SecurityTab logout={logout} navigate={navigate} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
};

export default SettingsPage;