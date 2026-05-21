import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { Menu, Bell, Globe, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import notificationApi from '@/features/common/services/notification.api';

const priorityColors = {
  critical: 'bg-red-500',
  urgent: 'bg-orange-500',
  high: 'bg-orange-400',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const typeIcons = {
  weather: '🌤️',
  admin: '📢',
};

export function Header({ title, subtitle, onMenuClick }) {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');

  const displayedNotifications = useMemo(() => {
    if (notificationFilter === 'all') {
      return notifications;
    }
    return notifications.filter((n) => n.type === notificationFilter);
  }, [notifications, notificationFilter]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllFeedAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      const newUnreadCount = notifications.filter(n => n.id !== notificationId && !n.is_read).length;
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, language]);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-6 sm:px-10 lg:px-12 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={onMenuClick}>
            <Menu className="w-5 h-5"/>
          </Button>
          <div className="hidden sm:block">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl gap-2 h-9 sm:h-10 text-xs sm:text-sm" 
            onClick={() => setLanguage(language === 'en' ? 'np' : 'en')}
          >
            <Globe className="w-4 h-4"/>
            <span className="hidden xs:inline">{language === 'en' ? 'नेपाली' : 'English'}</span>
          </Button>

          {/* Notification Bell Dropdown */}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 relative">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5"/>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-background">
                    <span className="text-[10px] text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="p-3 border-b space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{t('notifications.title')}</h3>
                    <p className="text-xs text-muted-foreground">{t('notifications.subtitle')}</p>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-8 shrink-0"
                    >
                      {t('notifications.markAllRead')}
                    </Button>
                  )}
                </div>
                <Select value={notificationFilter} onValueChange={setNotificationFilter}>
                  <SelectTrigger className="h-8 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('notifications.filterAll')}</SelectItem>
                    <SelectItem value="admin">{t('notifications.filterAdmin')}</SelectItem>
                    <SelectItem value="weather">{t('notifications.filterWeather')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-100">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
                  </div>
                ) : displayedNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">{t('notifications.noNotifications')}</p>
                  </div>
                ) : (
                  displayedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-b hover:bg-muted/50 cursor-pointer transition-colors",
                        !notification.is_read && "bg-muted/20"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{typeIcons[notification.type] || '📋'}</span>
                            <span className="font-medium text-sm">{notification.title}</span>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", priorityColors[notification.priority])}
                            >
                              {notification.priority_display}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1">
                              {notification.action_label && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = notification.action_url;
                                  }}
                                >
                                  {notification.action_label}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 4V3c0-1 1-2 2-2h4c1 0 2 1 2 2v1"/>
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar (Mobile) */}
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/>
          </div>
        </div>
      </div>
      
      {/* Mobile Title */}
      <div className="sm:hidden mt-2">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  );
}