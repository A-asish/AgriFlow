
import api from '@/services/api';
import { getAppLanguage } from '@/shared/utils/appLanguage';
import {
    filterFeedNotifications,
    filterFarmAlerts,
    countUnreadFeedNotifications,
} from '../utils/notificationFilters';

// Helper to check if user is admin
const isAdminUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user?.is_admin === true || user?.is_superuser === true;
        }
        return false;
    } catch {
        return false;
    }
};

const withLang = (params = {}) => ({
    lang: getAppLanguage(),
    ...params,
});

const notificationApi = {
    /**
     * GET /api/notifications/ — Get all notifications
     * Automatically uses admin endpoint if user is admin
     */
    getNotifications: async (params = {}) => {
        const isAdmin = isAdminUser();
        
        // If admin, use admin endpoint
        if (isAdmin) {
            try {
                const response = await api.get('admin/notifications/', { params });
                const notifications = response.data?.notifications || [];
                return {
                    success: true,
                    notifications: notifications,
                    unread_count: 0, // Admin doesn't have unread count from farmer perspective
                    count: notifications.length,
                };
            } catch (error) {
                console.error('❌ Error fetching admin notifications:', error);
                return {
                    success: false,
                    notifications: [],
                    unread_count: 0,
                    count: 0,
                    error: error.message,
                };
            }
        }
        
        // For farmers, use farmer endpoint
        try {
            const response = await api.get('notifications/', {
                params: withLang(params),
            });

            console.log('📥 Notification API Response:', response.data);

            let notifications = [];
            let unreadCount = 0;
            const success = true;

            if (response.data) {
                if (Array.isArray(response.data.notifications)) {
                    notifications = response.data.notifications;
                    unreadCount = response.data.unread_count || 0;
                } else if (Array.isArray(response.data.results)) {
                    notifications = response.data.results;
                    unreadCount = response.data.count || 0;
                } else if (response.data.id) {
                    notifications = [response.data];
                } else {
                    // Last resort: find any array in the response
                    for (const key in response.data) {
                        if (Array.isArray(response.data[key])) {
                            notifications = response.data[key];
                            break;
                        }
                    }
                }
            }

            if (!Array.isArray(notifications)) {
                notifications = [];
            }

            // When filtering by type, return raw list for that type
            if (params.type) {
                return {
                    success,
                    notifications,
                    unread_count: notifications.filter((n) => !n.is_read).length,
                    count: notifications.length,
                };
            }

            // Feed = admin + weather only
            const filteredNotifications = filterFeedNotifications(notifications);
            return {
                success,
                notifications: filteredNotifications,
                unread_count: countUnreadFeedNotifications(notifications),
                count: filteredNotifications.length,
            };
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
            return {
                success: false,
                notifications: [],
                unread_count: 0,
                count: 0,
                error: error.message,
            };
        }
    },

    /**
     * GET /api/notifications/unread-count/ — Get unread count
     * For admin, returns 0
     */
    getUnreadCount: async () => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            return { unread_count: 0 };
        }
        
        try {
            const response = await api.get('notifications/unread-count/');
            return {
                unread_count: response.data?.unread_count || 0,
            };
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return { unread_count: 0 };
        }
    },

    /**
     * GET /api/notifications/farm-alerts/ — Get farm alerts (crop + livestock)
     * For admin, returns empty
     */
    getFarmAlerts: async ({ status = 'active' } = {}) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            return { crop: [], livestock: [], all: [] };
        }
        
        try {
            // Trigger daily generation (if not already done today)
            await api.get('notifications/', {
                params: withLang({ limit: 1 }),
            });

            const response = await api.get('notifications/farm-alerts/', {
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

        // Fallback: fetch by type individually
        try {
            const [cropRes, livestockRes] = await Promise.all([
                api.get('notifications/', {
                    params: withLang({ type: 'crop', limit: 100 }),
                }),
                api.get('notifications/', {
                    params: withLang({ type: 'livestock', limit: 100 }),
                }),
            ]);

            const crop = filterFarmAlerts(cropRes.data?.notifications || [], { status });
            const livestock = filterFarmAlerts(livestockRes.data?.notifications || [], { status });

            return { crop, livestock, all: [...crop, ...livestock] };
        } catch (fallbackError) {
            console.error('Error fetching farm alerts:', fallbackError);
            return { crop: [], livestock: [], all: [] };
        }
    },

    /**
     * GET /api/notifications/ filtered by type
     * For admin, uses admin endpoint
     */
    getNotificationsByType: async (type, params = {}) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            try {
                const response = await api.get('admin/notifications/', { 
                    params: { type, ...params } 
                });
                return response.data?.notifications || [];
            } catch (error) {
                console.error(`Error fetching admin ${type} notifications:`, error);
                return [];
            }
        }
        
        try {
            const response = await api.get('notifications/', {
                params: withLang({ type, limit: 50, ...params }),
            });
            return response.data?.notifications || [];
        } catch (error) {
            console.error(`Error fetching ${type} notifications:`, error);
            return [];
        }
    },

    /**
     * GET /api/notifications/{id}/
     * For admin, uses admin endpoint
     */
    getNotification: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            try {
                const response = await api.get(`admin/notifications/${notificationId}/`);
                return response.data;
            } catch (error) {
                console.error('Error fetching admin notification:', error);
                throw error;
            }
        }
        
        try {
            const response = await api.get(`notifications/${notificationId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notification:', error);
            throw error;
        }
    },
    
    /**
     * PATCH /api/notifications/{id}/ — Mark as read
     * For admin, uses admin endpoint
     */
    markAsRead: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            try {
                const response = await api.patch(`admin/notifications/${notificationId}/`, {
                    is_read: true,
                });
                return response.data;
            } catch (error) {
                console.error('Error marking admin notification as read:', error);
                return { success: true };
            }
        }
        
        try {
            const response = await api.patch(`notifications/${notificationId}/`, {
                is_read: true,
            });
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * POST /api/notifications/{id}/mark-read/
     */
    markAsReadAlt: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            return notificationApi.markAsRead(notificationId);
        }
        
        try {
            const response = await api.post(`notifications/${notificationId}/mark-read/`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * POST /api/notifications/{id}/mark-unread/
     */
    markAsUnread: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            try {
                const response = await api.patch(`admin/notifications/${notificationId}/`, {
                    is_read: false,
                });
                return response.data;
            } catch (error) {
                console.error('Error marking admin notification as unread:', error);
                return { success: true };
            }
        }
        
        try {
            const response = await api.post(`notifications/${notificationId}/mark-unread/`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as unread:', error);
            throw error;
        }
    },

    /**
     * PATCH /api/notifications/{id}/ — Mark as completed
     */
    markAsCompleted: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            return { success: true };
        }
        
        try {
            const response = await api.patch(`notifications/${notificationId}/`, {
                is_completed: true,
                is_read: true,
            });
            return response.data;
        } catch (error) {
            console.error('Error marking notification as completed:', error);
            throw error;
        }
    },

    /**
     * POST /api/notifications/{id}/complete/
     */
    markAsCompletedAlt: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            return { success: true };
        }
        
        try {
            const response = await api.post(`notifications/${notificationId}/complete/`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as completed:', error);
            throw error;
        }
    },

    /**
     * POST /api/notifications/{id}/uncomplete/
     */
    markAsUncompleted: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            return { success: true };
        }
        
        try {
            const response = await api.post(`notifications/${notificationId}/uncomplete/`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as uncompleted:', error);
            throw error;
        }
    },

    /**
     * POST /api/notifications/mark-all-read/
     * For admin, uses admin endpoint
     */
    markAllAsRead: async () => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            try {
                const response = await api.post('admin/notifications/mark-all-read/');
                return response.data;
            } catch (error) {
                console.error('Error marking all admin notifications as read:', error);
                return { success: true, marked_count: 0 };
            }
        }
        
        try {
            const response = await api.post('notifications/mark-all-read/');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    /**
     * Mark all feed (admin + weather) notifications as read
     */
    markAllFeedAsRead: async () => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            return notificationApi.markAllAsRead();
        }
        
        try {
            const [admin, weather] = await Promise.all([
                notificationApi.getNotificationsByType('admin'),
                notificationApi.getNotificationsByType('weather'),
            ]);
            const unread = [...admin, ...weather].filter((n) => !n.is_read);
            await Promise.all(unread.map((n) => notificationApi.markAsRead(n.id)));
            return { marked_count: unread.length };
        } catch (error) {
            console.error('Error marking all feed as read:', error);
            throw error;
        }
    },

    /**
     * DELETE /api/notifications/{id}/
     * For admin, uses admin endpoint
     */
    deleteNotification: async (notificationId) => {
        const isAdmin = isAdminUser();
        
        if (isAdmin) {
            try {
                const response = await api.delete(`admin/notifications/${notificationId}/`);
                return response.data;
            } catch (error) {
                console.error('Error deleting admin notification:', error);
                throw error;
            }
        }
        
        try {
            const response = await api.delete(`notifications/${notificationId}/`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * GET /api/admin/notifications/
     */
    adminListNotifications: async (params = {}) => {
        try {
            const response = await api.get('admin/notifications/', { params });
            return response.data;
        } catch (error) {
            console.error('Error listing notifications:', error);
            throw error;
        }
    },

    /**
     * GET /api/admin/notifications/{id}/
     */
    adminGetNotification: async (notificationId) => {
        try {
            const response = await api.get(`admin/notifications/${notificationId}/`);
            return response.data;
        } catch (error) {
            console.error('Error getting notification:', error);
            throw error;
        }
    },

    /**
     * POST /api/admin/notifications/
     */
    adminSendNotification: async (data) => {
        try {
            const response = await api.post('admin/notifications/', data);
            return response.data;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    },

    /**
     * PUT /api/admin/notifications/{id}/
     */
    adminUpdateNotification: async (notificationId, data) => {
        try {
            const response = await api.put(`admin/notifications/${notificationId}/`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    },

    /**
     * PATCH /api/admin/notifications/{id}/
     */
    adminPartialUpdateNotification: async (notificationId, data) => {
        try {
            const response = await api.patch(`admin/notifications/${notificationId}/`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    },

    /**
     * DELETE /api/admin/notifications/{id}/
     */
    adminDeleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(`admin/notifications/${notificationId}/`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    /**
     * POST /api/admin/notifications/mark-all-read/
     */
    adminMarkAllAsRead: async () => {
        try {
            const response = await api.post('admin/notifications/mark-all-read/');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },
};

export default notificationApi;