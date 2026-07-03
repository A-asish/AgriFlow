import { Wheat, Beef, Clock, CircleCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';
import { priorityStyles, sourceColors } from './calendarTheme';

const sourceIcons = { crop: Wheat, livestock: Beef };

export function CalendarActivityCard({
    activity,
    compact = false,
    actionId,
    formatDate,
    onOpen,
    onMarkComplete,
}) {
    const { t } = useLanguage();
    const Icon = sourceIcons[activity.source] ?? Wheat;
    const busy = actionId === activity.id;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(activity)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpen(activity);
            }}
            className={cn(
                'rounded-xl border cursor-pointer transition-colors hover:shadow-md',
                sourceColors[activity.source] ?? sourceColors.crop,
                compact ? 'p-3' : 'p-4',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">{activity.title}</span>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'text-xs capitalize',
                                    priorityStyles[activity.priority] ?? priorityStyles.medium,
                                )}
                            >
                                {activity.priorityDisplay || activity.priority}
                            </Badge>
                        </div>
                        {activity.message && !compact && (
                            <p className="text-sm opacity-90 line-clamp-2 whitespace-pre-line">
                                {activity.message}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs opacity-80">
                            <span className="capitalize">
                                {activity.source === 'crop' ? t('nav.crops') : t('nav.livestock')}
                            </span>
                            {activity.dueDate && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(activity.dueDate)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {!compact && (
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                            size="sm"
                            disabled={busy}
                            className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkComplete(activity);
                            }}
                        >
                            {busy ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <CircleCheck className="w-3.5 h-3.5 mr-1" />
                            )}
                            {t('calendar.markComplete')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
