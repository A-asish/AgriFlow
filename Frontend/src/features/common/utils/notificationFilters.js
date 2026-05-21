/** Farm activity alerts shown on the dashboard (from Notification model). */
export const FARM_ALERT_TYPES = ['crop', 'livestock'];

/** Notification types shown in the header bell only. */
export const NOTIFICATION_FEED_TYPES = ['admin', 'weather'];

/** active = pending work; all = include history; completed = done tasks only */
export const FARM_ALERT_STATUSES = ['active', 'all', 'completed'];

export function isFarmAlert(notification) {
    const type = notification?.type?.toLowerCase?.() ?? '';
    return FARM_ALERT_TYPES.includes(type);
}

export function isFeedNotification(notification) {
    const type = notification?.type?.toLowerCase?.() ?? '';
    return NOTIFICATION_FEED_TYPES.includes(type);
}

export function filterFarmAlerts(notifications = [], { status = 'active' } = {}) {
    return notifications.filter((n) => {
        if (!isFarmAlert(n)) return false;
        if (status === 'active') {
            return !n.is_completed;
        }
        if (status === 'completed') {
            return Boolean(n.is_completed);
        }
        return true;
    });
}

export function filterFeedNotifications(notifications = []) {
    return notifications.filter(isFeedNotification);
}

export function countUnreadFeedNotifications(notifications = []) {
    return filterFeedNotifications(notifications).filter((n) => !n.is_read).length;
}
