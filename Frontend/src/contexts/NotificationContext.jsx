import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationApi from '../features/common/services/notification.api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch unread count only (lighter)
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllFeedAsRead();
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Recalculate unread count
      const newUnreadCount = notifications.filter(n => n.id !== notificationId && !n.is_read).length;
      setUnreadCount(newUnreadCount);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};