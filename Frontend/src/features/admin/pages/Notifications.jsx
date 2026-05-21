import React, { useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

const priorityColors = {
  critical: 'bg-red-500',
  urgent: 'bg-orange-500',
  high: 'bg-orange-400',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const typeIcons = {
  livestock: '🐄',
  crop: '🌾',
  weather: '🌤️',
  admin: '📢',
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Badge variant="secondary" className="ml-2">
            {unreadCount} unread
          </Badge>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-150">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">No notifications yet</p>
                <p className="text-sm">When you receive notifications, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      !notification.is_read ? 'bg-muted/20 border-blue-200' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{typeIcons[notification.type] || '📋'}</span>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <Badge className={priorityColors[notification.priority]}>
                            {notification.priority_display}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="default" className="bg-blue-500">New</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark read
                              </Button>
                            )}
                            {notification.action_url && notification.action_label && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = notification.action_url}
                              >
                                {notification.action_label}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}