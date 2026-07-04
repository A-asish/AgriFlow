import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Beef,
    Wheat,
    RefreshCw,
    Clock,
    CheckCircle2,
    Filter,
    CircleCheck,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import notificationApi from '@/features/common/services/notification.api';
import { normalizeReminder } from '../utils/reminderUtils';
import { applyAlertFilters, paginateAlerts } from '../utils/alertFilters';

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15];

const priorityStyles = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    urgent: 'bg-orange-100 text-orange-700 border-orange-200',
    high: 'bg-orange-50 text-orange-600 border-orange-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    low: 'bg-green-50 text-green-700 border-green-100',
};

const sourceIcons = {
    crop: Wheat,
    livestock: Beef,
};

const sourceColors = {
    crop: 'text-green-600 bg-green-50 border-green-100',
    livestock: 'text-amber-700 bg-amber-50 border-amber-100',
};

export function DashboardAlerts() {
    const { t, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [sourceFilter, setSourceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [dueDateFilter, setDueDateFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('date_newest'); // Changed from 'priority' to 'date_newest'
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionId, setActionId] = useState(null);

    const resetPagination = useCallback(() => setCurrentPage(1), []);

    const fetchAlerts = useCallback(
        async (showRefreshSpinner = false) => {
            if (!isAuthenticated) {
                setAlerts([]);
                setLoading(false);
                return;
            }

            if (showRefreshSpinner) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            try {
                const { crop, livestock } = await notificationApi.getFarmAlerts({
                    status: statusFilter,
                });

                const cropAlerts = (crop || []).map((a) => normalizeReminder(a, 'crop'));
                const livestockAlerts = (livestock || []).map((a) =>
                    normalizeReminder(a, 'livestock'),
                );

                setAlerts([...cropAlerts, ...livestockAlerts]);
            } catch (error) {
                console.error('Failed to fetch farm alerts:', error);
                setAlerts([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [isAuthenticated, language, statusFilter],
    );

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(() => fetchAlerts(true), 60000);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    useEffect(() => {
        resetPagination();
    }, [sourceFilter, statusFilter, priorityFilter, dueDateFilter, sortOrder, itemsPerPage, resetPagination]);

    const filteredAlerts = useMemo(
        () =>
            applyAlertFilters(alerts, {
                source: sourceFilter,
                priority: priorityFilter,
                dueDate: dueDateFilter,
                sort: sortOrder,
            }),
        [alerts, sourceFilter, priorityFilter, dueDateFilter, sortOrder],
    );

    const pagination = useMemo(
        () => paginateAlerts(filteredAlerts, currentPage, itemsPerPage),
        [filteredAlerts, currentPage, itemsPerPage],
    );

    const counts = useMemo(
        () => ({
            all: alerts.length,
            crop: alerts.filter((a) => a.source === 'crop').length,
            livestock: alerts.filter((a) => a.source === 'livestock').length,
        }),
        [alerts],
    );

    const handleMarkComplete = async (alert, e) => {
        e.stopPropagation();
        if (!alert.id || alert.isCompleted) return;
        setActionId(alert.id);
        try {
            await notificationApi.markAsCompleted(alert.id);
            if (statusFilter === 'active') {
                setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
            } else {
                setAlerts((prev) =>
                    prev.map((a) =>
                        a.id === alert.id ? { ...a, isCompleted: true, isRead: true } : a,
                    ),
                );
            }
        } catch (error) {
            console.error('Failed to mark alert complete:', error);
        } finally {
            setActionId(null);
        }
    };

    const handleReopen = async (alert, e) => {
        e.stopPropagation();
        if (!alert.id) return;
        setActionId(alert.id);
        try {
            await notificationApi.markAsUncompleted(alert.id);
            if (statusFilter === 'completed') {
                setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
            } else {
                setAlerts((prev) =>
                    prev.map((a) => (a.id === alert.id ? { ...a, isCompleted: false } : a)),
                );
            }
        } catch (error) {
            console.error('Failed to reopen alert:', error);
        } finally {
            setActionId(null);
        }
    };

    const handleDismiss = async (alert, e) => {
        e.stopPropagation();
        if (!alert.id || alert.isRead) return;
        setActionId(alert.id);
        try {
            await notificationApi.markAsRead(alert.id);
            setAlerts((prev) =>
                prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a)),
            );
        } catch (error) {
            console.error('Failed to dismiss alert:', error);
        } finally {
            setActionId(null);
        }
    };

    const handleAlertClick = (alert) => {
        // 1. Use actionUrl from API if present
        if (alert.actionUrl) {
            navigate(alert.actionUrl);
            return;
        }
        // 2. Build URL from sourceId if available
        if (alert.sourceId) {
            if (alert.source === 'crop') {
                navigate(`/crops/${alert.sourceId}`);
            } else if (alert.source === 'livestock') {
                navigate(`/livestock/${alert.sourceId}`);
            }
            return;
        }
        // 3. Fallback to the list page for that source
        if (alert.source === 'crop') {
            navigate('/crops');
        } else if (alert.source === 'livestock') {
            navigate('/livestock');
        }
    };

    const formatDueDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return null;
        const locale = language === 'np' ? 'ne-NP' : 'en-US';
        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const emptyMessage =
        statusFilter === 'completed'
            ? t('dashboard.noCompletedAlerts')
            : statusFilter === 'all'
              ? t('dashboard.noFarmAlertsHistory')
              : t('dashboard.noFarmAlerts');

    const hasActiveFilters =
        priorityFilter !== 'all' || dueDateFilter !== 'all' || sortOrder !== 'priority';

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                            {t('dashboard.farmAlerts')}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {t('dashboard.farmAlertsSubtitle')}
                        </p>
                        <p className="text-xs text-amber-700/90 mt-1">
                            {t('dashboard.markCompleteHint')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            setStatusFilter(v);
                            resetPagination();
                        }}
                    >
                        <SelectTrigger className="w-32.5 rounded-xl h-9 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">{t('dashboard.alertsStatusActive')}</SelectItem>
                            <SelectItem value="all">{t('dashboard.alertsStatusAll')}</SelectItem>
                            <SelectItem value="completed">
                                {t('dashboard.alertsStatusCompleted')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={sourceFilter}
                        onValueChange={(v) => {
                            setSourceFilter(v);
                            resetPagination();
                        }}
                    >
                        <SelectTrigger className="w-38.75 rounded-xl h-9 gap-2 text-xs">
                            <Filter className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('dashboard.alertsFilterAll')} ({counts.all})
                            </SelectItem>
                            <SelectItem value="crop">
                                {t('dashboard.alertsFilterCrops')} ({counts.crop})
                            </SelectItem>
                            <SelectItem value="livestock">
                                {t('dashboard.alertsFilterLivestock')} ({counts.livestock})
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => fetchAlerts(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                    </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-muted/30 border border-muted/50">
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-35 rounded-lg h-8 text-xs bg-background">
                            <SelectValue placeholder={t('dashboard.filterSeverity')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('dashboard.severityAll')}</SelectItem>
                            <SelectItem value="critical">{t('dashboard.severityCritical')}</SelectItem>
                            <SelectItem value="urgent">{t('dashboard.severityUrgent')}</SelectItem>
                            <SelectItem value="high">{t('dashboard.severityHigh')}</SelectItem>
                            <SelectItem value="medium">{t('dashboard.severityMedium')}</SelectItem>
                            <SelectItem value="low">{t('dashboard.severityLow')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                        <SelectTrigger className="w-37.5 rounded-lg h-8 text-xs bg-background">
                            <SelectValue placeholder={t('dashboard.filterDueDate')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('dashboard.dueDateAll')}</SelectItem>
                            <SelectItem value="overdue">{t('dashboard.dueDateOverdue')}</SelectItem>
                            <SelectItem value="today">{t('dashboard.dueDateToday')}</SelectItem>
                            <SelectItem value="upcoming">{t('dashboard.dueDateUpcoming')}</SelectItem>
                            <SelectItem value="this_week">{t('dashboard.dueDateThisWeek')}</SelectItem>
                            <SelectItem value="this_month">{t('dashboard.dueDateThisMonth')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-37.5 rounded-lg h-8 text-xs bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="priority">{t('dashboard.sortByPriority')}</SelectItem>
                            <SelectItem value="date_newest">{t('dashboard.sortNewest')}</SelectItem>
                            <SelectItem value="date_oldest">{t('dashboard.sortOldest')}</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs rounded-lg"
                            onClick={() => {
                                setPriorityFilter('all');
                                setDueDateFilter('all');
                                setSortOrder('priority');
                            }}
                        >
                            {t('dashboard.clearFilters')}
                        </Button>
                    )}
                </div>
            </div>

            {!loading && filteredAlerts.length > 0 && (
                <p className="text-xs text-muted-foreground -mt-2 mb-2">
                    {language === 'np'
                        ? `${pagination.startIndex}–${pagination.endIndex} मध्ये ${pagination.total} सतर्कता`
                        : `Showing ${pagination.startIndex}–${pagination.endIndex} of ${pagination.total} alerts`}
                </p>
            )}

            <ScrollArea className="h-[min(320px,50vh)] pr-2">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
                    </div>
                ) : pagination.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <CheckCircle2 className="w-10 h-10 mb-2 text-green-500 opacity-80" />
                        <p className="text-sm font-medium text-center">
                            {hasActiveFilters
                                ? t('dashboard.noAlertsMatchFilters')
                                : emptyMessage}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pagination.items.map((alert) => {
                            const Icon = sourceIcons[alert.source] ?? AlertTriangle;
                            const busy = actionId === alert.id;
                            return (
                                <div
                                    key={`${alert.source}-${alert.id}`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleAlertClick(alert)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleAlertClick(alert);
                                        }
                                    }}
                                    className={cn(
                                        'p-3 rounded-xl border cursor-pointer transition-colors hover:shadow-md',
                                        sourceColors[alert.source],
                                        alert.isCompleted && 'opacity-75',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                            <Icon className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                                    <span
                                                        className={cn(
                                                            'font-semibold text-sm truncate',
                                                            alert.isRead &&
                                                                !alert.isCompleted &&
                                                                'opacity-80',
                                                        )}
                                                    >
                                                        {alert.title}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-[10px] h-4.5 px-1.5 capitalize',
                                                            priorityStyles[alert.priority] ??
                                                                priorityStyles.medium,
                                                        )}
                                                    >
                                                        {alert.priorityDisplay || alert.priority}
                                                    </Badge>
                                                    {alert.source === 'crop' && alert.cropName && (
                                                        <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 bg-green-50 text-green-700 border-green-200 font-normal">
                                                            🌾 {alert.cropName}
                                                        </Badge>
                                                    )}
                                                    {alert.source === 'livestock' && alert.animalTag && (
                                                        <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 bg-amber-50 text-amber-700 border-amber-100 font-normal">
                                                            🐄 {alert.animalTag}
                                                        </Badge>
                                                    )}
                                                    {alert.isCompleted && (
                                                        <Badge className="text-[10px] h-4.5 px-1.5 bg-green-600 text-white font-normal">
                                                            {t('dashboard.alertCompleted')}
                                                        </Badge>
                                                    )}
                                                    {!alert.isRead && !alert.isCompleted && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                                    )}
                                                </div>
                                                {alert.message && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 opacity-90">
                                                        {alert.message}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] opacity-75">
                                                    <span className="capitalize font-medium">
                                                        {alert.source === 'crop'
                                                            ? t('nav.crops')
                                                            : t('nav.livestock')}
                                                    </span>
                                                    {alert.dueDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {t('dashboard.alertSent')}:{' '}
                                                            {formatDueDate(alert.dueDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="flex flex-col gap-1 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {!alert.isCompleted ? (
                                                <Button
                                                    size="sm"
                                                    disabled={busy}
                                                    className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700"
                                                    onClick={(e) => handleMarkComplete(alert, e)}
                                                >
                                                    <CircleCheck className="w-3.5 h-3.5 mr-1" />
                                                    {t('dashboard.markComplete')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={busy}
                                                    className="h-8 text-xs rounded-lg"
                                                    onClick={(e) => handleReopen(alert, e)}
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                                    {t('dashboard.reopenAlert')}
                                                </Button>
                                            )}
                                            {!alert.isRead && !alert.isCompleted && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={busy}
                                                    className="h-8 text-xs rounded-lg"
                                                    onClick={(e) => handleDismiss(alert, e)}
                                                >
                                                    {t('dashboard.dismissAlert')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {!loading && pagination.total > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {t('dashboard.perPage')}
                        </span>
                        <Select
                            value={String(itemsPerPage)}
                            onValueChange={(v) => {
                                setItemsPerPage(Number(v));
                                resetPagination();
                            }}
                        >
                            <SelectTrigger className="w-17.5 h-8 rounded-lg text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center sm:justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-xs gap-1"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={pagination.currentPage === 1}
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                {t('common.previous')}
                            </Button>
                            <span className="text-xs text-muted-foreground min-w-25 text-center">
                                {language === 'np'
                                    ? `पृष्ठ ${pagination.currentPage} / ${pagination.totalPages}`
                                    : `Page ${pagination.currentPage} of ${pagination.totalPages}`}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-xs gap-1"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(pagination.totalPages, p + 1),
                                    )
                                }
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                {t('common.next')}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}