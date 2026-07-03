import api from '../../../services/api';
import { getAppLanguage } from '@/shared/utils/appLanguage';
import {
    filterFeedNotifications,
    filterFarmAlerts,
    countUnreadFeedNotifications,
} from '../utils/notificationFilters';

const withLang = (params = {}) => ({
    lang: getAppLanguage(),
    ...params,
});

const notificationApi = {
    /**
     * GET /api/notifications/ — triggers daily crop/livestock generation on the backend.
     * Pass ?lang=np|en for localized title/message from title_np/message_np fields.
     */
    getNotifications: async (params = {}) => {
        const response = await api.get('/notifications/', { params: withLang(params) });
        const data = response.data;
        const all = data.notifications || [];

        if (params.type) {
            return {
                ...data,
                notifications: all,
                unread_count: all.filter((n) => !n.is_read).length,
            };
        }

        const notifications = filterFeedNotifications(all);
        return {
            ...data,
            notifications,
            unread_count: countUnreadFeedNotifications(all),
        };
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/', {
            params: withLang({ limit: 100 }),
        });
        return {
            unread_count: countUnreadFeedNotifications(
                response.data?.notifications || [],
            ),
        };
    },

    /**
     * Dashboard farm alerts (localized).
     * Uses /notifications/farm-alerts/ when available; falls back to typed list API.
     */
    getFarmAlerts: async ({ status = 'active' } = {}) => {
        // Triggers daily crop/livestock generation on the backend
        await api.get('/notifications/', { params: withLang({ limit: 1 }) });

        try {
            const response = await api.get('/notifications/farm-alerts/', {
                params: withLang({ status }),
            });
            const crop = (response.data?.crop || []).map((n) => ({
                ...n,
                notification_type: 'crop',
            }));
            const livestock = (response.data?.livestock || []).map((n) => ({
                ...n,
                notification_type: 'livestock',
            }));
            return { crop, livestock, all: [...crop, ...livestock] };
        } catch (error) {
            console.warn('farm-alerts endpoint failed, falling back to typed notifications', error);
        }

        const [cropRes, livestockRes] = await Promise.all([
            api.get('/notifications/', { params: withLang({ type: 'crop', limit: 100 }) }),
            api.get('/notifications/', {
                params: withLang({ type: 'livestock', limit: 100 }),
            }),
        ]);

        const crop = filterFarmAlerts(cropRes.data?.notifications || [], { status });
        const livestock = filterFarmAlerts(livestockRes.data?.notifications || [], { status });

        return { crop, livestock, all: [...crop, ...livestock] };
    },

    getNotificationsByType: async (type, params = {}) => {
        const response = await api.get('/notifications/', {
            params: withLang({ type, limit: 50, ...params }),
        });
        return response.data?.notifications || [];
    },

    markAsRead: async (notificationId) => {
        const response = await api.patch(`/notifications/${notificationId}/`, {
            is_read: true,
        });
        return response.data;
    },

    markAsCompleted: async (notificationId) => {
        const response = await api.patch(`/notifications/${notificationId}/`, {
            is_completed: true,
            is_read: true,
        });
        return response.data;
    },

    markAsUncompleted: async (notificationId) => {
        const response = await api.patch(`/notifications/${notificationId}/`, {
            is_completed: false,
        });
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch('/notifications/mark-all-read/');
        return response.data;
    },

    markAllFeedAsRead: async () => {
        const [admin, weather] = await Promise.all([
            notificationApi.getNotificationsByType('admin'),
            notificationApi.getNotificationsByType('weather'),
        ]);
        const unread = [...admin, ...weather].filter((n) => !n.is_read);
        await Promise.all(unread.map((n) => notificationApi.markAsRead(n.id)));
        return { marked_count: unread.length };
    },

    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/notifications/${notificationId}/`);
        return response.data;
    },
};

export default notificationApi;
