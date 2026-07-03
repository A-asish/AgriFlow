// src/features/settings/components/PreferencesTab.jsx

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/shared/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Globe, Bell, CheckCircle2 } from 'lucide-react';

const SectionHeader = ({ icon: Icon, title, className = 'text-blue-600 bg-blue-50' }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${className}`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
);

const PreferencesTab = ({ language, setLanguage, user }) => {
    const { t } = useLanguage();

    return (
        <div className="farm-card">
            <SectionHeader icon={Globe} title={t('settings.preferences')} className="text-blue-600 bg-blue-50" />
            <p className="text-sm text-muted-foreground mb-6">{t('settings.preferencesDescription')}</p>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary shrink-0" />
                        <div>
                            <p className="font-semibold">{t('settings.language')}</p>
                            <p className="text-sm text-muted-foreground">{t('settings.languageDescription')}</p>
                        </div>
                    </div>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-full sm:w-44 h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">🇬🇧 English</SelectItem>
                            <SelectItem value="np">🇳🇵 नेपाली</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                        {user?.is_email_verified ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                            <Bell className="w-5 h-5 text-amber-600 shrink-0" />
                        )}
                        <div>
                            <p className="font-semibold">{t('settings.emailAlerts')}</p>
                            <p className="text-sm text-muted-foreground">{t('settings.emailDesc')}</p>
                        </div>
                    </div>
                    <Badge variant={user?.is_email_verified ? 'default' : 'outline'} className="rounded-lg px-4 py-2">
                        {user?.is_email_verified ? t('settings.verified') : t('settings.unverified')}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default PreferencesTab;