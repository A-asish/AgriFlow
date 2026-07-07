// src/features/common/components/layout/NotificationBell.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, Clock, AlertCircle, X } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import NotificationFullViewModal from '../NotificationFullViewModal';
import { toast } from 'sonner';

const NotificationBell = () => {
  const { t, language } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead,
    markAllAsRead,
    fetchUnreadCount
  } = useNotification();
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  
  // ✅ Track if we've already fetched once to prevent repeated calls
  const hasFetchedRef = useRef(false);

  // ✅ Only fetch when dropdown opens, but only if we haven't fetched recently
  useEffect(() => {
    if (isDropdownOpen && !hasFetchedRef.current) {
      fetchNotifications();
      hasFetchedRef.current = true;
    }
  }, [isDropdownOpen, fetchNotifications]);

  // ✅ Reset fetch flag when dropdown closes
  useEffect(() => {
    if (!isDropdownOpen) {
      // Reset after a delay to allow for new notifications to come in
      const timer = setTimeout(() => {
        hasFetchedRef.current = false;
      }, 5000); // 5 seconds delay
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen]);

  // ✅ Refresh unread count periodically
  useEffect(() => {
    if (!isDropdownOpen) {
      const interval = setInterval(() => {
        if (fetchUnreadCount) {
          fetchUnreadCount();
        }
      }, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isDropdownOpen, fetchUnreadCount]);

  // ✅ Handle clicking on a notification - opens modal
  const handleViewFull = (notification) => {
    console.log('🔔 Opening notification modal:', notification);
    setSelectedNotification(notification);
    setIsModalOpen(true);
    // Mark as read when viewed (if not already)
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsDropdownOpen(false);
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    await markAsRead(id);
    // Update the selected notification if it's the same one
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => ({ ...prev, is_read: true }));
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
      toast.success(
        language === 'np' ? 'सबै सूचनाहरू पढिएको चिन्ह लगाइयो' : 'All notifications marked as read'
      );
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(
        language === 'np' ? 'सबै सूचनाहरू पढिएको चिन्ह लगाउन असफल' : 'Failed to mark all as read'
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationComplete = async (id) => {
    // Refresh notifications after complete
    await fetchNotifications();
    // Refresh unread count
    if (fetchUnreadCount) {
      await fetchUnreadCount();
    }
  };

  const handleNotificationReopen = async (id) => {
    // Refresh notifications after reopen
    await fetchNotifications();
    // Refresh unread count
    if (fetchUnreadCount) {
      await fetchUnreadCount();
    }
  };

  // Format date with language support
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const locale = language === 'np' ? 'ne-NP' : 'en-US';
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Get localized text
  const getLocalizedText = (en, np) => {
    if (language === 'np' && np) return np;
    return en;
  };

  // Get priority label with language support
  const getPriorityLabel = (priority) => {
    const labels = {
      low: language === 'np' ? 'न्यून' : 'Low',
      medium: language === 'np' ? 'मध्यम' : 'Medium',
      high: language === 'np' ? 'उच्च' : 'High',
      urgent: language === 'np' ? 'अत्यावश्यक' : 'Urgent',
      critical: language === 'np' ? 'जोखिमपूर्ण' : 'Critical'
    };
    return labels[priority] || priority || 'Medium';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <Clock className="w-3 h-3" />,
      medium: <AlertCircle className="w-3 h-3" />,
      high: <AlertCircle className="w-3 h-3" />,
      urgent: <AlertCircle className="w-3 h-3 text-red-500" />,
      critical: <AlertCircle className="w-3 h-3 text-red-600" />
    };
    return icons[priority] || <Bell className="w-3 h-3" />;
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-95 max-w-[90vw] p-0 dark:bg-gray-900 dark:border-gray-700"
          sideOffset={8}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {language === 'np' ? 'सूचनाहरू' : 'Notifications'}
              {unreadCount > 0 && (
                <Badge className="bg-blue-500 text-white ml-1">
                  {unreadCount}
                </Badge>
              )}
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                {isMarkingAll ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                ) : (
                  language === 'np' ? 'सबै पढ्नुहोस्' : 'Mark all read'
                )}
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm">
                  {language === 'np' ? 'लोड हुँदै...' : 'Loading...'}
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-medium">
                  {language === 'np' ? 'कुनै सूचनाहरू छैनन्' : 'No notifications'}
                </p>
                <p className="text-sm">
                  {language === 'np' ? 'तपाईं सबै अपडेट हुनुहुन्छ!' : "You're all caught up!"}
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => {
                const title = getLocalizedText(notification.title, notification.title_np);
                const message = getLocalizedText(notification.message, notification.message_np);
                
                return (
                  <div
                    key={notification.id || notification._id || Math.random()}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${
                      !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleViewFull(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getPriorityIcon(notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-50">
                            {title || 'Notification'}
                          </h4>
                          <Badge className={`text-[10px] ${getPriorityColor(notification.priority)}`}>
                            {getPriorityLabel(notification.priority)}
                          </Badge>
                          {!notification.is_read && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {message || 'No message'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {formatDate(notification.sent_at || notification.created_at)}
                          </span>
                          {notification.is_read ? (
                            <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> 
                              {language === 'np' ? 'पढियो' : 'Read'}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {language === 'np' ? 'पढिएको चिन्ह लगाउनुहोस्' : 'Mark read'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>

          {notifications.length > 10 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                onClick={() => {
                  setIsDropdownOpen(false);
                }}
              >
                {language === 'np' ? 'सबै सूचनाहरू हेर्नुहोस्' : 'View all notifications'}
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ✅ Full View Modal - Always render, even if no notification selected */}
      <NotificationFullViewModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          console.log('🔔 Closing modal');
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        onMarkRead={async (id) => {
          await markAsRead(id);
          if (selectedNotification && selectedNotification.id === id) {
            setSelectedNotification(prev => ({ ...prev, is_read: true }));
          }
        }}
        onMarkComplete={handleNotificationComplete}
        onReopen={handleNotificationReopen}
      />
    </>
  );
};

export default NotificationBell;