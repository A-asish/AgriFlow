import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Globe, LogOut, Save, Camera } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/shared/components/ui/switch';
const SettingsPage = () => {
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const handleSave = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        toast.success(t('settings.profileUpdated'));
    };
    return (<MainLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
        <div className="farm-card p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mb-8 sm:mb-12">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg overflow-hidden">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-primary"/>
              </div>
              <button className="absolute bottom-1 right-1 p-2 sm:p-2.5 rounded-full gradient-hero text-primary-foreground shadow-md hover:scale-110 transition-transform">
                <Camera className="w-4 h-4"/>
              </button>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1 sm:mb-2 truncate">{user?.full_name || user?.username}</h3>
              <p className="text-sm sm:text-base text-muted-foreground font-medium mb-4 sm:mb-6">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <Label>{t('settings.fullName')}</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="rounded-xl"/>
            </div>
            <div className="space-y-1.5">
              <Label>{t('settings.email')}</Label>
              <Input value={form.email} disabled className="rounded-xl bg-muted/50"/>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave} disabled={loading} className="w-full rounded-xl h-11 font-bold gap-2">
                <Save className="w-4 h-4"/> {loading ? t('settings.saving') : t('settings.saveChanges')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <div className="farm-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-primary"/>
              <h3 className="text-lg font-bold">{t('settings.language')}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-sm font-bold">English</span>
                <Switch checked={language === 'en'} onCheckedChange={() => setLanguage('en')}/>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-sm font-bold">नेपाली (Nepali)</span>
                <Switch checked={language === 'np'} onCheckedChange={() => setLanguage('np')}/>
              </div>
            </div>
          </div>
        </div>

        <div className="farm-card p-6 sm:p-8 border-destructive/20 bg-destructive/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-destructive"/>
              <div>
                <h3 className="text-lg font-bold text-destructive">{t('settings.logout')}</h3>
                <p className="text-xs text-muted-foreground">{t('settings.logoutDesc')}</p>
              </div>
            </div>
            <Button variant="destructive" className="rounded-xl font-bold px-6" onClick={logout}>
              {t('settings.logout')}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>);
};
export default SettingsPage;
