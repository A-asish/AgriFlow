// src/features/common/components/layout/NotificationBell.jsx

import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle, X } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
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
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotification();
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    if (isDropdownOpen) {
      fetchNotifications();
    }
  }, [isDropdownOpen, fetchNotifications]);

  const handleViewFull = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    // Mark as read when viewed
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsDropdownOpen(false);
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
      setIsDropdownOpen(false);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: <Clock className="w-3 h-3" />,
      medium: <AlertCircle className="w-3 h-3" />,
      high: <AlertCircle className="w-3 h-3" />,
      urgent: <AlertCircle className="w-3 h-3 text-red-500" />
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
            className="relative rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-95 max-w-[90vw] p-0"
          sideOffset={8}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
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
                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                {isMarkingAll ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                ) : (
                  'Mark all read'
                )}
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleViewFull(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-900 truncate max-w-50">
                          {notification.title}
                        </h4>
                        <Badge className={`text-[10px] ${getPriorityColor(notification.priority)}`}>
                          {notification.priority || 'Medium'}
                        </Badge>
                        {!notification.is_read && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(notification.sent_at).toLocaleDateString()}
                        </span>
                        {notification.is_read ? (
                          <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Read
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          {notifications.length > 10 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Navigate to notifications page if you have one
                  // navigate('/farmer/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Full View Modal */}
      <NotificationFullViewModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        onMarkRead={markAsRead}
      />
    </>
  );
};

export default NotificationBell;