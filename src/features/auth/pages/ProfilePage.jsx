import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/features/auth/services/auth.api';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Camera, Save, Loader2, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const ProfilePage = () => {
    const { user, refreshProfile } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        location: '',
        district: '',
    });
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.full_name.split(' ')[0] || '',
                last_name: user.full_name.split(' ').slice(1).join(' ') || '',
                phone: user.phone || '',
                location: user.location || '',
                district: '', // Assuming district might be separate in some models
            });
        }
    }, [user]);
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        setLoading(true);
        try {
            await authService.updateProfile(user.id, formData);
            await refreshProfile();
            toast.success(t('auth.profileUpdated') || 'Profile updated successfully');
        }
        catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        }
        finally {
            setLoading(false);
        }
    };
    return (<MainLayout title={t('auth.profile') || 'My Profile'} subtitle={t('auth.manageProfile') || 'Manage your personal information'}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="pt-10 pb-8 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-lg mx-auto overflow-hidden">
                    <User className="w-16 h-16 text-emerald-600"/>
                  </div>
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-lg border-2 border-white">
                    <Camera className="w-4 h-4"/>
                  </Button>
                </div>
                <h2 className="text-2xl font-black mt-4">{user?.full_name}</h2>
                <p className="text-muted-foreground font-medium">@{user?.username}</p>
                <div className="mt-6 pt-6 border-t flex justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('auth.role') || 'Role'}</p>
                    <p className="font-bold">{user?.is_farmer ? 'Farmer' : 'User'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary"/> {t('auth.security') || 'Security'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start rounded-xl gap-2 h-12">
                  <Lock className="w-4 h-4"/> {t('auth.changePassword') || 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Form Section */}
          <div className="w-full md:w-2/3">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-black">{t('auth.personalInfo') || 'Personal Information'}</CardTitle>
                <CardDescription>{t('auth.personalInfoDesc') || 'Update your contact details and location'}</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('auth.firstName') || 'First Name'}</Label>
                      <Input value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="h-12 rounded-xl"/>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('auth.lastName') || 'Last Name'}</Label>
                      <Input value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="h-12 rounded-xl"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('auth.email') || 'Email Address'}</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                      <Input value={user?.email} disabled className="h-12 pl-11 rounded-xl bg-muted/50"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('auth.phone') || 'Phone Number'}</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                      <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-12 pl-11 rounded-xl" placeholder="+977-XXXXXXXXXX"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('auth.location') || 'Location'}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="h-12 pl-11 rounded-xl"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('auth.district') || 'District'}</Label>
                      <Input value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} className="h-12 rounded-xl"/>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                      {t('common.saveChanges') || 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>);
};
export default ProfilePage;
