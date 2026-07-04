// src/contexts/NotificationContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationApi from '@/features/common/services/notification.api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      
      // Handle the response properly
      let data = response;
      
      // If response has a data property, use it
      if (response && response.data) {
        data = response.data;
      }
      
      // Extract notifications
      const notifs = data.notifications || [];
      const unread = data.unread_count ?? 0;
      
      // Ensure notifications is an array
      const notificationsArray = Array.isArray(notifs) ? notifs : [];
      
      setNotifications(notificationsArray);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show toast for network errors, just log them
      if (error.response && error.response.status !== 403) {
        toast.error('Failed to fetch notifications');
      }
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      
      setNotifications(prev => {
        const updated = prev.map(n => {
          if (n.id === notificationId) {
            return { 
              ...n, 
              is_read: true, 
              read_at: new Date().toISOString() 
            };
          }
          return n;
        });
        return updated;
      });
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
      await fetchNotifications();
      throw error;
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      
      const now = new Date().toISOString();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: now }))
      );
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
      await fetchNotifications();
      throw error;
    }
  }, [fetchNotifications]);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const { isAuthenticated } = useAuth();

  // Initial fetch — only when the user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Poll for new notifications every 30 seconds (only when authenticated)
  useEffect(() => {
    if (!isPolling || !isAuthenticated) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPolling]);

  // Listen for visibility change (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    setIsPolling,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};