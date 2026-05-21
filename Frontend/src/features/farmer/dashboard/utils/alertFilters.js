import { sortAlertsByPriority } from './reminderUtils';

const PRIORITY_ORDER = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };

export const PRIORITY_FILTER_OPTIONS = ['all', 'critical', 'urgent', 'high', 'medium', 'low'];

export const DUE_DATE_FILTER_OPTIONS = [
    'all',
    'overdue',
    'today',
    'upcoming',
    'this_week',
    'this_month',
];

export const SORT_OPTIONS = ['priority', 'date_newest', 'date_oldest'];

export function getAlertDate(alert) {
    const raw = alert.dueDate ?? alert.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function isAlertOverdue(alert) {
    const text = `${alert.title ?? ''} ${alert.message ?? ''}`.toLowerCase();
    if (text.includes('overdue') || text.includes('म्याद नाघ')) {
        return true;
    }
    const date = getAlertDate(alert);
    if (!date) return alert.priority === 'critical';
    return date < startOfDay(new Date()) && !alert.isCompleted;
}

export function isAlertDueToday(alert) {
    const text = `${alert.title ?? ''} ${alert.message ?? ''}`.toLowerCase();
    if (
        text.includes('today') ||
        text.includes('scheduled today') ||
        text.includes('आज')
    ) {
        return true;
    }
    const date = getAlertDate(alert);
    return date ? isSameDay(date, new Date()) : false;
}

export function isAlertUpcoming(alert) {
    if (isAlertOverdue(alert) || isAlertDueToday(alert)) {
        return false;
    }
    const text = `${alert.title ?? ''} ${alert.message ?? ''}`.toLowerCase();
    if (
        text.includes('tomorrow') ||
        (text.includes('in ') && text.includes('days')) ||
        text.includes('भोलि') ||
        text.includes('दिनमा')
    ) {
        return true;
    }
    const date = getAlertDate(alert);
    return date ? date > startOfDay(new Date()) : false;
}

export function filterAlertsBySource(alerts, sourceFilter) {
    if (sourceFilter === 'crop') {
        return alerts.filter((a) => a.source === 'crop');
    }
    if (sourceFilter === 'livestock') {
        return alerts.filter((a) => a.source === 'livestock');
    }
    return alerts;
}

export function filterAlertsByPriority(alerts, priorityFilter) {
    if (!priorityFilter || priorityFilter === 'all') {
        return alerts;
    }
    return alerts.filter((a) => a.priority === priorityFilter);
}

export function filterAlertsByDueDate(alerts, dueDateFilter) {
    if (!dueDateFilter || dueDateFilter === 'all') {
        return alerts;
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    return alerts.filter((alert) => {
        const date = getAlertDate(alert);

        switch (dueDateFilter) {
            case 'overdue':
                return isAlertOverdue(alert);
            case 'today':
                return isAlertDueToday(alert);
            case 'upcoming':
                return isAlertUpcoming(alert);
            case 'this_week':
                return date ? date >= weekAgo : false;
            case 'this_month':
                return date ? date >= monthAgo : false;
            default:
                return true;
        }
    });
}

export function sortAlerts(alerts, sortOrder) {
    const list = [...alerts];
    if (sortOrder === 'date_newest') {
        return list.sort((a, b) => {
            const da = getAlertDate(a)?.getTime() ?? 0;
            const db = getAlertDate(b)?.getTime() ?? 0;
            return db - da;
        });
    }
    if (sortOrder === 'date_oldest') {
        return list.sort((a, b) => {
            const da = getAlertDate(a)?.getTime() ?? Infinity;
            const db = getAlertDate(b)?.getTime() ?? Infinity;
            return da - db;
        });
    }
    return sortAlertsByPriority(list);
}

export function applyAlertFilters(alerts, filters) {
    let result = alerts;
    result = filterAlertsBySource(result, filters.source);
    result = filterAlertsByPriority(result, filters.priority);
    result = filterAlertsByDueDate(result, filters.dueDate);
    result = sortAlerts(result, filters.sort);
    return result;
}

export function paginateAlerts(alerts, page, perPage) {
    const total = alerts.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage) || 1);
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * perPage;
    return {
        items: alerts.slice(start, start + perPage),
        total,
        totalPages,
        currentPage: safePage,
        startIndex: total === 0 ? 0 : start + 1,
        endIndex: Math.min(start + perPage, total),
    };
}
