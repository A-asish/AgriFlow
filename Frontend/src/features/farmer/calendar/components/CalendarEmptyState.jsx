import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function CalendarEmptyState({ variant = 'day' }) {
    const { t } = useLanguage();
    const isUpcoming = variant === 'upcoming';

    return (
        <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
            {isUpcoming ? (
                <CheckCircle2 className="w-10 h-10 mb-3 text-green-500 opacity-80" />
            ) : (
                <CalendarIcon className="w-10 h-10 mb-3 opacity-25" />
            )}
            <p className="text-sm font-medium text-center max-w-xs">
                {isUpcoming ? t('calendar.noUpcoming') : t('calendar.noActivities')}
            </p>
        </div>
    );
}
