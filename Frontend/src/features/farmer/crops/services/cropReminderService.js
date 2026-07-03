// src/features/farmer/crops/services/cropReminderService.js

import api from '@/services/api';
import notificationApi from '@/features/common/services/notification.api';

/**
 * Crop alerts use the shared Notification API (type=crop).
 * See backend: notifications/views.py, crops/views.py PendingCropActivitiesView.
 */
export const cropReminderService = {
    /**
     * Get pending crop reminders from farm alerts
     */
    getPendingReminders: async () => {
        try {
            console.log('🔍 [cropReminderService] Fetching pending reminders...');
            const response = await notificationApi.getFarmAlerts({ status: 'active' });
            console.log('📊 [cropReminderService] Farm alerts response:', response);
            
            // ✅ Check if response has crop data
            const cropAlerts = response?.crop || [];
            console.log(`✅ [cropReminderService] Found ${cropAlerts.length} crop alerts`);
            
            return cropAlerts;
        } catch (error) {
            console.error('❌ [cropReminderService] Error fetching reminders:', error);
            return [];
        }
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (notificationId) => {
        try {
            await notificationApi.markAsRead(notificationId);
            return true;
        } catch (error) {
            console.error('❌ Error marking as read:', error);
            return false;
        }
    },

    /**
     * Mark notification as completed
     */
    markAsCompleted: async (notificationId) => {
        try {
            await notificationApi.markAsCompleted(notificationId);
            return true;
        } catch (error) {
            console.error('❌ Error marking as completed:', error);
            return false;
        }
    },

    /**
     * Mark notification as uncompleted (reopen)
     */
    markAsUncompleted: async (notificationId) => {
        try {
            await notificationApi.markAsUncompleted(notificationId);
            return true;
        } catch (error) {
            console.error('❌ Error marking as uncompleted:', error);
            return false;
        }
    },

    /**
     * Generate crop reminders manually
     */
    generateReminders: async () => {
        try {
            const response = await api.post('/crops/reminders/generate/');
            console.log('✅ Reminders generated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error generating reminders:', error);
            return null;
        }
    },

    /**
     * Get pending activities from backend (alternative endpoint)
     */
    getPendingActivities: async () => {
        try {
            const response = await api.get('/crops/reminders/pending/');
            console.log('📊 Pending activities:', response.data);
            return response.data?.activities ?? [];
        } catch (error) {
            console.error('❌ Error fetching pending activities:', error);
            return [];
        }
    },

    /**
     * Get all crop notifications
     */
    getAllCropNotifications: async (limit = 100) => {
        try {
            const response = await notificationApi.getNotifications({ 
                type: 'crop', 
                limit 
            });
            console.log(`📊 Found ${response?.notifications?.length || 0} crop notifications`);
            return response?.notifications || [];
        } catch (error) {
            console.error('❌ Error fetching crop notifications:', error);
            return [];
        }
    },

    /**
     * Get unread count for crop notifications
     */
    getUnreadCount: async () => {
        try {
            const response = await notificationApi.getNotifications({ 
                type: 'crop', 
                limit: 1 
            });
            return response?.unread_count || 0;
        } catch (error) {
            console.error('❌ Error fetching unread count:', error);
            return 0;
        }
    }
};

// Convenience exports
export const fetchCropReminders = () => cropReminderService.getPendingReminders();
export const markReminderAsRead = (notificationId) =>
    cropReminderService.markAsRead(notificationId);
export const markReminderAsCompleted = (notificationId) =>
    cropReminderService.markAsCompleted(notificationId);
export const markReminderAsUncompleted = (notificationId) =>
    cropReminderService.markAsUncompleted(notificationId);
export const generateReminders = () => cropReminderService.generateReminders();

export default cropReminderService;