import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import notificationApi from '@/features/common/services/notification.api';
import { normalizeReminder } from '@/features/farmer/dashboard/utils/reminderUtils';

export const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

export const isSameDay = (a, b) => {
    if (!a || !b) return false;
    const d1 = new Date(a);
    const d2 = new Date(b);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export function useCalendarActivities() {
    const { language } = useLanguage();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [date, setDate] = useState(new Date());
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [sourceFilter, setSourceFilter] = useState('all');

    const fetchActivities = useCallback(
        async (showRefresh = false) => {
            if (!isAuthenticated) {
                setActivities([]);
                setLoading(false);
                return;
            }

            if (showRefresh) setRefreshing(true);
            else setLoading(true);

            try {
                const { crop, livestock } = await notificationApi.getFarmAlerts({ status: 'active' });
                const all = [
                    ...(crop || []).map((a) => normalizeReminder(a, 'crop')),
                    ...(livestock || []).map((a) => normalizeReminder(a, 'livestock')),
                ];
                setActivities(all);
            } catch (error) {
                console.error('Failed to fetch calendar activities:', error);
                setActivities([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [isAuthenticated, language],
    );

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const filteredActivities = useMemo(() => {
        if (sourceFilter === 'all') return activities;
        return activities.filter((a) => a.source === sourceFilter);
    }, [activities, sourceFilter]);

    const selectedDayActivities = useMemo(
        () => filteredActivities.filter((a) => isSameDay(a.dueDate, date)),
        [filteredActivities, date],
    );

    const upcomingActivities = useMemo(() => {
        const today = startOfDay(new Date());
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        return [...filteredActivities]
            .filter((a) => {
                if (!a.dueDate) return false;
                const d = startOfDay(a.dueDate);
                return d >= today && d <= weekEnd;
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 8);
    }, [filteredActivities]);

    const stats = useMemo(() => {
        const today = startOfDay(new Date());
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);

        let dueToday = 0;
        let thisWeek = 0;

        activities.forEach((a) => {
            if (!a.dueDate) return;
            const d = startOfDay(a.dueDate);
            if (isSameDay(d, today)) dueToday += 1;
            if (d >= today && d <= weekEnd) thisWeek += 1;
        });

        return { dueToday, thisWeek, pending: activities.length };
    }, [activities]);

    const datesWithActivities = useMemo(() => {
        const map = new Map();
        filteredActivities.forEach((a) => {
            if (!a.dueDate) return;
            map.set(startOfDay(a.dueDate).toISOString(), true);
        });
        return map;
    }, [filteredActivities]);

    const counts = useMemo(
        () => ({
            all: activities.length,
            crop: activities.filter((a) => a.source === 'crop').length,
            livestock: activities.filter((a) => a.source === 'livestock').length,
        }),
        [activities],
    );

    const formatDate = useCallback(
        (dateStr, options = {}) => {
            if (!dateStr) return null;
            const d = new Date(dateStr);
            if (Number.isNaN(d.getTime())) return null;
            const locale = language === 'np' ? 'ne-NP' : 'en-US';
            return d.toLocaleDateString(locale, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                ...options,
            });
        },
        [language],
    );

    const markComplete = useCallback(async (activity) => {
        if (!activity?.id) return;
        setActionId(activity.id);
        try {
            await notificationApi.markAsCompleted(activity.id);
            setActivities((prev) => prev.filter((a) => a.id !== activity.id));
        } catch (error) {
            console.error('Failed to mark complete:', error);
        } finally {
            setActionId(null);
        }
    }, []);

    const openActivity = useCallback(
        (activity) => {
            if (activity?.actionUrl) navigate(activity.actionUrl);
        },
        [navigate],
    );

    return {
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
        refresh: fetchActivities,
        markComplete,
        openActivity,
    };
}
