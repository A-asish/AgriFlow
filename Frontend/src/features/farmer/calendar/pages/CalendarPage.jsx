import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCalendarActivities } from '../hooks/useCalendarActivities';
import { CalendarPageSkeleton } from '../components/CalendarPageSkeleton';
import { CalendarStats } from '../components/CalendarStats';
import { CalendarScheduleSection } from '../components/CalendarScheduleSection';
import { CalendarSidebar } from '../components/CalendarSidebar';

const CalendarPage = () => {
    const { t } = useLanguage();
    const {
        authLoading,
        isAuthenticated,
        date,
        setDate,
        sourceFilter,
        setSourceFilter,
        loading,
        refreshing,
        actionId,
        selectedDayActivities,
        upcomingActivities,
        stats,
        counts,
        datesWithActivities,
        formatDate,
        refresh,
        markComplete,
        openActivity,
    } = useCalendarActivities();

    if (authLoading || loading) {
        return (
            <MainLayout title={t('calendar.title')} subtitle={t('calendar.subtitle')}>
                <CalendarPageSkeleton />
            </MainLayout>
        );
    }

    if (!isAuthenticated) {
        return (
            <MainLayout title={t('calendar.title')} subtitle={t('calendar.subtitle')}>
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">{t('dashboard.loginToView')}</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={t('calendar.title')} subtitle={t('calendar.subtitle')}>
            <div className="max-w-6xl mx-auto space-y-6">
                <CalendarStats stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <CalendarScheduleSection
                            date={date}
                            sourceFilter={sourceFilter}
                            onSourceFilterChange={setSourceFilter}
                            selectedDayActivities={selectedDayActivities}
                            formatDate={formatDate}
                            refreshing={refreshing}
                            onRefresh={refresh}
                            actionId={actionId}
                            onOpen={openActivity}
                            onMarkComplete={markComplete}
                            counts={counts}
                        />
                    </div>

                    <div className="order-1 lg:order-2">
                        <CalendarSidebar
                            date={date}
                            onDateChange={setDate}
                            datesWithActivities={datesWithActivities}
                            upcomingActivities={upcomingActivities}
                            formatDate={formatDate}
                            actionId={actionId}
                            onOpen={openActivity}
                            onMarkComplete={markComplete}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CalendarPage;
