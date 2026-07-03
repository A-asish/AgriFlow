import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const statConfig = [
    { key: 'dueToday', icon: AlertTriangle, accent: 'bg-rose-50 text-rose-600' },
    { key: 'thisWeek', icon: Calendar, accent: 'bg-amber-50 text-amber-600' },
    { key: 'pending', icon: Clock, accent: 'bg-emerald-50 text-emerald-600' },
];

const labelKeys = {
    dueToday: 'calendar.dueToday',
    thisWeek: 'calendar.thisWeek',
    pending: 'calendar.pendingTotal',
};

export function CalendarStats({ stats }) {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statConfig.map(({ key, icon: Icon, accent }) => (
                <div
                    key={key}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-4"
                >
                    <div className={`p-3 rounded-xl ${accent}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t(labelKeys[key])}
                        </p>
                        <p className="text-2xl font-black text-gray-800">{stats[key] ?? 0}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
