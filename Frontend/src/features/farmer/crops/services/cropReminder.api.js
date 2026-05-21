import api from '@/services/api';
import notificationApi from '@/features/common/services/notification.api';

/**
 * Crop alerts use the shared Notification API (type=crop).
 * See backend: notifications/views.py, crops/views.py PendingCropActivitiesView.
 */
export const cropReminderService = {
    getPendingReminders: async () => {
        const { crop } = await notificationApi.getFarmAlerts();
        return crop;
    },

    markAsRead: async (notificationId) => {
        await notificationApi.markAsRead(notificationId);
        return true;
    },

    generateReminders: async () => {
        const response = await api.post('/crops/reminders/generate/');
        return response.data;
    },

    /** GET /api/crops/reminders/pending/ — same notifications, activities shape */
    getPendingActivities: async () => {
        const response = await api.get('/crops/reminders/pending/');
        return response.data?.activities ?? [];
    },
};

export const fetchCropReminders = () => cropReminderService.getPendingReminders();
export const markReminderAsRead = (notificationId) =>
    cropReminderService.markAsRead(notificationId);
export const generateReminders = () => cropReminderService.generateReminders();

export default cropReminderService;
