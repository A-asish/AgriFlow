// src/features/common/components/NotificationFullViewModal.jsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Calendar
} from 'lucide-react';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const priorityIcons = {
  low: <Clock className="w-4 h-4" />,
  medium: <AlertCircle className="w-4 h-4" />,
  high: <AlertCircle className="w-4 h-4" />,
  urgent: <AlertCircle className="w-4 h-4 text-red-500" />,
  critical: <AlertCircle className="w-4 h-4 text-red-600" />
};

const typeIcons = {
  broadcast: '📢',
  targeted: '🎯',
  weather_alert: '🌤️',
  crop_reminder: '🌾',
  admin: '📢',
  weather: '🌤️',
  crop: '🌾',
  livestock: '🐄'
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', { dateStyle: 'medium' });
};

const NotificationFullViewModal = ({ notification, isOpen, onClose, onMarkRead }) => {
  if (!notification) return null;

  const handleMarkRead = () => {
    if (!notification.is_read && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  const notifType = notification.notification_type || notification.type;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xl">{typeIcons[notifType] || '📢'}</span>
                <Badge className={`${priorityColors[notification.priority] || 'bg-gray-100'} font-semibold`}>
                  {priorityIcons[notification.priority]} {notification.priority_display || notification.priority?.toUpperCase() || 'MEDIUM'}
                </Badge>
                <Badge className="bg-gray-800 text-white border-0 font-semibold">
                  {notification.type_display || 'Announcement'}
                </Badge>
                {notification.is_read ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" /> Read
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                    <AlertCircle className="w-3 h-3 mr-1" /> Unread
                  </Badge>
                )}
              </div>
              <span className="text-xl font-bold text-gray-900">
                {notification.title}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="space-y-6 p-1">
            {/* Message Content */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Message
              </h4>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sent At
                </h4>
                <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDateTime(notification.created_at)}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Notification Type
                </h4>
                <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                  <span className="text-base">{typeIcons[notifType] || '📢'}</span>
                  {notification.type_display || 'Announcement'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              {!notification.is_read && (
                <Button
                  onClick={handleMarkRead}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationFullViewModal;