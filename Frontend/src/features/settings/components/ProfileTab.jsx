// src/features/settings/components/ProfileTab.jsx

import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { User, Mail, Phone, MapPin, Camera, Loader2, Save, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/features/auth/services/auth.api';
import { getApiErrorMessage } from '@/shared/utils/apiError';

const API_URL = import.meta.env.VITE_API_URL || '';

const resolveMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const regionOptions = [
    { value: 'terai', labelKey: 'auth.terai' },
    { value: 'hilly', labelKey: 'auth.hilly' },
    { value: 'himalayan', labelKey: 'auth.himalayan' },
];

const soilOptions = [
    { value: 'alluvial', labelKey: 'settings.soilAlluvial' },
    { value: 'clay', labelKey: 'settings.soilClay' },
    { value: 'sandy', labelKey: 'settings.soilSandy' },
    { value: 'loamy', labelKey: 'settings.soilLoamy' },
    { value: 'peaty', labelKey: 'settings.soilPeaty' },
    { value: 'chalky', labelKey: 'settings.soilChalky' },
    { value: 'silt', labelKey: 'settings.soilSilt' },
    { value: 'laterite', labelKey: 'settings.soilLaterite' },
    { value: 'mountain', labelKey: 'settings.soilMountain' },
    { value: 'terra_rossa', labelKey: 'settings.soilTerraRossa' },
];

const waterSourceOptions = [
    { value: 'irrigation', labelKey: 'settings.waterIrrigation' },
    { value: 'river', labelKey: 'settings.waterRiver' },
    { value: 'well', labelKey: 'settings.waterWell' },
    { value: 'borewell', labelKey: 'settings.waterBorewell' },
    { value: 'pond', labelKey: 'settings.waterPond' },
    { value: 'rainwater', labelKey: 'settings.waterRainwater' },
    { value: 'spring', labelKey: 'settings.waterSpring' },
    { value: 'canal', labelKey: 'settings.waterCanal' },
];

const SectionHeader = ({ icon: Icon, title, className = 'text-emerald-600 bg-emerald-50' }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${className}`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
);

const ProfileTab = ({
    user,
    formData,
    saving,
    uploadingPhoto,
    setUploadingPhoto,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    refreshProfile,
}) => {
    const { t } = useLanguage();

    const regions = useMemo(
        () => regionOptions.map((o) => ({ ...o, label: t(o.labelKey) })),
        [t],
    );
    const soils = useMemo(
        () => soilOptions.map((o) => ({ ...o, label: t(o.labelKey) })),
        [t],
    );
    const waterSources = useMemo(
        () => waterSourceOptions.map((o) => ({ ...o, label: t(o.labelKey) })),
        [t],
    );

    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith('image/')) {
            toast.error(t('settings.invalidImageType'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('settings.imageTooLarge'));
            return;
        }

        setUploadingPhoto(true);
        try {
            await authService.updateProfile(user.id, { profile_picture: file });
            await refreshProfile();
            toast.success(t('settings.profilePictureUpdated'));
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('common.error')));
        } finally {
            setUploadingPhoto(false);
        }
    };

    const profileImageUrl = resolveMediaUrl(user?.profile_picture);

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-80 shrink-0">
                <div className="farm-card text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-background shadow-lg overflow-hidden mx-auto">
                            {profileImageUrl ? (
                                <img
                                    src={profileImageUrl}
                                    alt={user?.full_name || user?.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-14 h-14 text-emerald-600" />
                            )}
                        </div>
                        <label
                            htmlFor="profile-picture"
                            className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition shadow-md"
                        >
                            {uploadingPhoto ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                                <Camera className="w-4 h-4 text-white" />
                            )}
                            <input
                                id="profile-picture"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePictureUpload}
                                disabled={uploadingPhoto}
                            />
                        </label>
                    </div>
                    <h2 className="text-xl font-black text-foreground">
                        {user?.full_name || user?.username}
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium">@{user?.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <Badge variant="secondary" className="rounded-lg">
                            {user?.is_farmer ? t('settings.farmerAccount') : t('settings.userAccount')}
                        </Badge>
                        <Badge variant={user?.is_email_verified ? 'default' : 'outline'} className="rounded-lg">
                            {user?.is_email_verified ? t('settings.verified') : t('settings.unverified')}
                        </Badge>
                    </div>

                    {(user?.farm_name || user?.geographical_region) && (
                        <div className="mt-6 pt-6 border-t border-border/50 space-y-2 text-left">
                            {user?.farm_name && (
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        {t('settings.farmName')}
                                    </p>
                                    <p className="font-semibold">{user.farm_name}</p>
                                </div>
                            )}
                            {user?.geographical_region && (
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        {t('settings.region')}
                                    </p>
                                    <p className="font-semibold capitalize">
                                        {regions.find((r) => r.value === user.geographical_region)?.label ||
                                            user.geographical_region}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4">{t('settings.clickToChangePhoto')}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-6">
                <div className="farm-card">
                    <SectionHeader icon={User} title={t('auth.personalInfo')} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.firstName')}
                            </Label>
                            <Input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.lastName')}
                            </Label>
                            <Input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.email')}
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input value={user?.email} disabled className="h-12 pl-11 rounded-xl bg-muted/50" />
                            </div>
                            <p className="text-xs text-muted-foreground">{t('settings.emailDisabled')}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.phone')}
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="h-12 pl-11 rounded-xl input-field"
                                    placeholder={t('auth.phonePlaceholder')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="farm-card">
                    <SectionHeader icon={MapPin} title={t('settings.location')} className="text-blue-600 bg-blue-50" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.district')}
                            </Label>
                            <Input
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.location')}
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="h-12 pl-11 rounded-xl input-field"
                                    placeholder={t('auth.locationPlaceholder')}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.region')}
                            </Label>
                            <Select
                                value={formData.geographical_region}
                                onValueChange={(value) => handleSelectChange('geographical_region', value)}
                            >
                                <SelectTrigger className="h-12 rounded-xl input-field">
                                    <SelectValue placeholder={t('settings.selectRegion')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {regions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="farm-card">
                    <SectionHeader icon={Building2} title={t('settings.farmInformation')} className="text-amber-600 bg-amber-50" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.farmName')}
                            </Label>
                            <Input
                                name="farm_name"
                                value={formData.farm_name}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.farmArea')}
                            </Label>
                            <Input
                                name="total_farm_area"
                                type="number"
                                step="0.01"
                                value={formData.total_farm_area}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.village')}
                            </Label>
                            <Input
                                name="farm_village"
                                value={formData.farm_village}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.municipality')}
                            </Label>
                            <Input
                                name="farm_municipality"
                                value={formData.farm_municipality}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.farmDistrict')}
                            </Label>
                            <Input
                                name="farm_district"
                                value={formData.farm_district}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.province')}
                            </Label>
                            <Input
                                name="farm_province"
                                value={formData.farm_province}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.wardNumber')}
                            </Label>
                            <Input
                                name="farm_ward_number"
                                type="number"
                                value={formData.farm_ward_number}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.altitude')}
                            </Label>
                            <Input
                                name="farm_altitude"
                                type="number"
                                value={formData.farm_altitude}
                                onChange={handleInputChange}
                                className="h-12 rounded-xl input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.soilType')}
                            </Label>
                            <Select
                                value={formData.farm_soil_type}
                                onValueChange={(value) => handleSelectChange('farm_soil_type', value)}
                            >
                                <SelectTrigger className="h-12 rounded-xl input-field">
                                    <SelectValue placeholder={t('settings.selectSoilType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {soils.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t('settings.waterSource')}
                            </Label>
                            <Select
                                value={formData.water_source}
                                onValueChange={(value) => handleSelectChange('water_source', value)}
                            >
                                <SelectTrigger className="h-12 rounded-xl input-field">
                                    <SelectValue placeholder={t('settings.selectWaterSource')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {waterSources.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl text-base font-bold gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {t('common.saveChanges')}
                </Button>
            </form>
        </div>
    );
};

export default ProfileTab;