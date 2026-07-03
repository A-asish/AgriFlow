import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    User,
    MapPin,
    Building2,
    Settings,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const resolveMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const InfoRow = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
        <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="font-semibold text-foreground mt-0.5">{value}</p>
        </div>
    );
};

const SectionHeader = ({ icon: Icon, title, className = 'text-emerald-600 bg-emerald-50' }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl ${className}`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
);

const ProfilePage = () => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const regionLabel = (value) => {
        const map = {
            terai: t('auth.terai'),
            hilly: t('auth.hilly'),
            himalayan: t('auth.himalayan'),
        };
        return map[value] || value;
    };

    const soilLabel = (value) => {
        const map = {
            alluvial: t('settings.soilAlluvial'),
            clay: t('settings.soilClay'),
            sandy: t('settings.soilSandy'),
            loamy: t('settings.soilLoamy'),
            peaty: t('settings.soilPeaty'),
            chalky: t('settings.soilChalky'),
            silt: t('settings.soilSilt'),
            laterite: t('settings.soilLaterite'),
            mountain: t('settings.soilMountain'),
            terra_rossa: t('settings.soilTerraRossa'),
        };
        return map[value] || value;
    };

    const waterLabel = (value) => {
        const map = {
            irrigation: t('settings.waterIrrigation'),
            river: t('settings.waterRiver'),
            well: t('settings.waterWell'),
            borewell: t('settings.waterBorewell'),
            pond: t('settings.waterPond'),
            rainwater: t('settings.waterRainwater'),
            spring: t('settings.waterSpring'),
            canal: t('settings.waterCanal'),
        };
        return map[value] || value;
    };

    const profileImageUrl = resolveMediaUrl(user?.profile_picture);

    if (authLoading) {
        return (
            <MainLayout title={t('auth.profile')} subtitle={t('auth.manageProfile')}>
                <div className="max-w-5xl mx-auto space-y-6">
                    <Skeleton className="h-48 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
            </MainLayout>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <MainLayout title={t('auth.profile')} subtitle={t('auth.manageProfile')}>
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">{t('dashboard.loginToView')}</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={t('auth.profile')} subtitle={t('auth.manageProfile')}>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Profile card */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="farm-card text-center">
                            <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-background shadow-lg overflow-hidden mx-auto mb-4">
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl}
                                        alt={user.full_name || user.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-14 h-14 text-emerald-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-black text-foreground">
                                {user.full_name || user.username}
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium">@{user.username}</p>
                            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>

                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                <Badge variant="secondary" className="rounded-lg">
                                    {user.is_farmer ? t('settings.farmerAccount') : t('settings.userAccount')}
                                </Badge>
                                <Badge
                                    variant={user.is_email_verified ? 'default' : 'outline'}
                                    className="rounded-lg"
                                >
                                    {user.is_email_verified ? t('settings.verified') : t('settings.unverified')}
                                </Badge>
                            </div>

                            <Button
                                className="w-full mt-6 rounded-xl h-11 gap-2 font-semibold"
                                onClick={() => navigate('/settings')}
                            >
                                <Settings className="w-4 h-4" />
                                {t('settings.goToSettings')}
                            </Button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-6">
                        <div className="farm-card">
                            <SectionHeader icon={User} title={t('auth.personalInfo')} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InfoRow label={t('settings.firstName')} value={user.first_name} />
                                <InfoRow label={t('settings.lastName')} value={user.last_name} />
                                <InfoRow label={t('settings.email')} value={user.email} />
                                <InfoRow label={t('settings.phone')} value={user.phone} />
                            </div>
                        </div>

                        <div className="farm-card">
                            <SectionHeader
                                icon={MapPin}
                                title={t('settings.location')}
                                className="text-blue-600 bg-blue-50"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InfoRow label={t('settings.district')} value={user.district} />
                                <InfoRow label={t('settings.location')} value={user.location} />
                                <InfoRow
                                    label={t('settings.region')}
                                    value={user.geographical_region ? regionLabel(user.geographical_region) : null}
                                />
                            </div>
                        </div>

                        {(user.farm_name ||
                            user.total_farm_area ||
                            user.farm_village ||
                            user.farm_soil_type ||
                            user.water_source) && (
                            <div className="farm-card">
                                <SectionHeader
                                    icon={Building2}
                                    title={t('settings.farmInformation')}
                                    className="text-amber-600 bg-amber-50"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <InfoRow label={t('settings.farmName')} value={user.farm_name} />
                                    <InfoRow
                                        label={t('settings.farmArea')}
                                        value={
                                            user.total_farm_area != null
                                                ? `${user.total_farm_area} ha`
                                                : null
                                        }
                                    />
                                    <InfoRow label={t('settings.village')} value={user.farm_village} />
                                    <InfoRow label={t('settings.municipality')} value={user.farm_municipality} />
                                    <InfoRow label={t('settings.farmDistrict')} value={user.farm_district} />
                                    <InfoRow label={t('settings.province')} value={user.farm_province} />
                                    <InfoRow label={t('settings.wardNumber')} value={user.farm_ward_number} />
                                    <InfoRow
                                        label={t('settings.altitude')}
                                        value={user.farm_altitude != null ? `${user.farm_altitude} m` : null}
                                    />
                                    <InfoRow
                                        label={t('settings.soilType')}
                                        value={user.farm_soil_type ? soilLabel(user.farm_soil_type) : null}
                                    />
                                    <InfoRow
                                        label={t('settings.waterSource')}
                                        value={user.water_source ? waterLabel(user.water_source) : null}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="farm-card border-dashed border-primary/30 bg-primary/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{t('settings.title')}</p>
                                        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-xl shrink-0"
                                    onClick={() => navigate('/settings')}
                                >
                                    {t('settings.goToSettings')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfilePage;
