import notificationApi from '@/features/common/services/notification.api';

/**
 * Livestock alerts use the shared Notification API (type=livestock).
 * Backend: livestock/alert_generator.py → Notification model (no /livestock/reminders/ route).
 */
export const livestockReminderService = {
    getPendingReminders: async () => {
        const { livestock } = await notificationApi.getFarmAlerts();
        return livestock;
    },

    markAsRead: async (notificationId) => {
        await notificationApi.markAsRead(notificationId);
        return true;
    },

    /** Triggers generation via GET /api/notifications/ */
    generateReminders: async () => {
        await notificationApi.getFarmAlerts();
        const { livestock } = await notificationApi.getFarmAlerts();
        return { success: true, count: livestock.length };
    },
};

export const fetchLivestockReminders = () => livestockReminderService.getPendingReminders();
export const markLivestockReminderAsRead = (notificationId) =>
    livestockReminderService.markAsRead(notificationId);
export const generateLivestockReminders = () => livestockReminderService.generateReminders();

export default livestockReminderService;
