import React, { useState, useMemo } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
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

export const NotificationBell = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  const displayedNotifications = useMemo(() => {
    if (notificationFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === notificationFilter);
  }, [notifications, notificationFilter]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    // Navigate to the action URL if provided
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
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
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs shrink-0">
                <CheckCheck className="h-3 w-3 mr-1" />
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
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
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
                          <Trash2 className="h-3 w-3" />
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
  );
};