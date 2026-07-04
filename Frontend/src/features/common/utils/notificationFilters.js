// src/features/common/utils/notificationFilters.js

/**
 * Filter notifications for the feed (admin and weather types)
 */
export const filterFeedNotifications = (notifications) => {
  // Ensure notifications is an array
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('filterFeedNotifications: notifications is not an array', notifications);
    return [];
  }
  
  return notifications.filter(
    (n) => n.notification_type === 'admin' || n.notification_type === 'weather'
  );
};

/**
 * Filter farm alerts (crop and livestock notifications)
 */
export const filterFarmAlerts = (notifications, { status = 'active' } = {}) => {
  // Ensure notifications is an array
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('filterFarmAlerts: notifications is not an array', notifications);
    return [];
  }
  
  let filtered = notifications.filter(
    (n) => n.notification_type === 'crop' || n.notification_type === 'livestock'
  );
  
  // Filter by status
  if (status === 'active') {
    filtered = filtered.filter((n) => !n.is_completed);
  } else if (status === 'completed') {
    filtered = filtered.filter((n) => n.is_completed);
  }
  
  return filtered;
};

/**
 * Count unread feed notifications
 */
export const countUnreadFeedNotifications = (notifications) => {
  // Ensure notifications is an array
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('countUnreadFeedNotifications: notifications is not an array', notifications);
    return 0;
  }
  
  return notifications.filter(
    (n) => !n.is_read && (n.notification_type === 'admin' || n.notification_type === 'weather')
  ).length;
};

/**
 * Get notification type label
 */
export const getNotificationType = (type) => {
  const types = {
    admin: 'Admin',
    weather: 'Weather',
    crop: 'Crop',
    livestock: 'Livestock',
    broadcast: 'Broadcast',
    targeted: 'Targeted',
    weather_alert: 'Weather Alert',
    crop_reminder: 'Crop Reminder',
    marketing: 'Marketing',
    alert: 'Alert',
    reminder: 'Reminder',
    system: 'System',
  };
  return types[type] || type || 'Notification';
};

/**
 * Get notification type icon
 */
export const getNotificationTypeIcon = (type) => {
  const icons = {
    admin: '📢',
    weather: '🌤️',
    crop: '🌾',
    livestock: '🐄',
    broadcast: '📢',
    targeted: '🎯',
    weather_alert: '🌤️',
    crop_reminder: '🌾',
    marketing: '💰',
    alert: '🔔',
    reminder: '⏰',
    system: '⚙️',
  };
  return icons[type] || '📨';
};

/**
 * Get notification type color
 */
export const getNotificationTypeColor = (type) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    weather: 'bg-blue-100 text-blue-800',
    crop: 'bg-green-100 text-green-800',
    livestock: 'bg-orange-100 text-orange-800',
    broadcast: 'bg-indigo-100 text-indigo-800',
    targeted: 'bg-pink-100 text-pink-800',
    weather_alert: 'bg-blue-100 text-blue-800',
    crop_reminder: 'bg-green-100 text-green-800',
    marketing: 'bg-yellow-100 text-yellow-800',
    alert: 'bg-red-100 text-red-800',
    reminder: 'bg-amber-100 text-amber-800',
    system: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

/**
 * Get priority label
 */
export const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    critical: 'Critical',
  };
  return labels[priority] || priority || 'Medium';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

/**
 * Format notification date
 */
export const formatNotificationDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Get time ago string
 */
export const getTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { dateStyle: 'medium' });
  } catch {
    return 'N/A';
  }
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications) => {
  // Ensure notifications is an array
  if (!notifications || !Array.isArray(notifications)) {
    return {};
  }
  
  const groups = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  notifications.forEach((notification) => {
    const date = new Date(notification.sent_at || notification.created_at);
    date.setHours(0, 0, 0, 0);
    
    let key;
    if (date.getTime() === today.getTime()) {
      key = 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      key = 'Yesterday';
    } else {
      key = date.toLocaleDateString('en-IN', { 
        dateStyle: 'medium' 
      });
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);
  });
  
  return groups;
};

/**
 * Sort notifications by date (newest first)
 */
export const sortNotificationsByDate = (notifications) => {
  if (!notifications || !Array.isArray(notifications)) {
    return [];
  }
  
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.sent_at || a.created_at);
    const dateB = new Date(b.sent_at || b.created_at);
    return dateB - dateA;
  });
};

/**
 * Filter notifications by search term
 */
export const filterNotificationsBySearch = (notifications, searchTerm) => {
  if (!notifications || !Array.isArray(notifications)) {
    return [];
  }
  
  if (!searchTerm || searchTerm.trim() === '') {
    return notifications;
  }
  
  const term = searchTerm.toLowerCase().trim();
  return notifications.filter((n) => {
    return (
      n.title?.toLowerCase().includes(term) ||
      n.message?.toLowerCase().includes(term) ||
      n.notification_type?.toLowerCase().includes(term)
    );
  });
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = (notifications) => {
  if (!notifications || !Array.isArray(notifications)) {
    return 0;
  }
  return notifications.filter((n) => !n.is_read).length;
};

/**
 * Check if notification is urgent
 */
export const isUrgentNotification = (notification) => {
  if (!notification) return false;
  return notification.priority === 'urgent' || 
         notification.priority === 'critical' ||
         notification.is_critical === true;
};