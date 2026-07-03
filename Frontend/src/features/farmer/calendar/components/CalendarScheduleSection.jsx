import { CalendarDays, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CalendarActivityCard } from './CalendarActivityCard';
import { CalendarEmptyState } from './CalendarEmptyState';

export function CalendarScheduleSection({
    date,
    sourceFilter,
    onSourceFilterChange,
    selectedDayActivities,
    formatDate,
    refreshing,
    onRefresh,
    actionId,
    onOpen,
    onMarkComplete,
    counts,
}) {
    const { t } = useLanguage();

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-50 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                                {t('calendar.schedule')}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-2 self-start"
                        onClick={() => onRefresh(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                        {t('common.refresh')}
                    </Button>
                </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
                <Tabs value={sourceFilter} onValueChange={onSourceFilterChange}>
                    <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100 rounded-xl p-1 h-auto">
                        <TabsTrigger
                            value="all"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
                        >
                            {t('calendar.allActivities')} ({counts.all})
                        </TabsTrigger>
                        <TabsTrigger
                            value="crop"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
                        >
                            {t('calendar.cropActivities')} ({counts.crop})
                        </TabsTrigger>
                        <TabsTrigger
                            value="livestock"
                            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-2"
                        >
                            {t('calendar.livestockActivities')} ({counts.livestock})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={sourceFilter} className="mt-4">
                        <ScrollArea className="h-[min(360px,55vh)] pr-2">
                            {selectedDayActivities.length === 0 ? (
                                <CalendarEmptyState variant="day" />
                            ) : (
                                <div className="space-y-3">
                                    {selectedDayActivities.map((activity) => (
                                        <CalendarActivityCard
                                            key={activity.id}
                                            activity={activity}
                                            actionId={actionId}
                                            formatDate={formatDate}
                                            onOpen={onOpen}
                                            onMarkComplete={onMarkComplete}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
