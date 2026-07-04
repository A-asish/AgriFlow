// src/features/admin/components/NotificationDetailModal.jsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Mail,
  Languages
} from 'lucide-react';

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const priorityIcons = {
  low: <Clock className="w-4 h-4" />,
  medium: <AlertCircle className="w-4 h-4" />,
  high: <AlertCircle className="w-4 h-4" />,
  urgent: <AlertCircle className="w-4 h-4 text-red-500" />
};

const typeIcons = {
  broadcast: '📢',
  targeted: '🎯',
  weather_alert: '🌤️',
  crop_reminder: '🌾',
  marketing: '💰'
};

const typeLabels = {
  broadcast: 'Broadcast',
  targeted: 'Targeted',
  weather_alert: 'Weather Alert',
  crop_reminder: 'Crop Reminder',
  marketing: 'Marketing/Promo'
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return 'N/A';
  }
};

const NotificationDetailModal = ({ notification, isOpen, onClose }) => {
  if (!notification) return null;

  const getTargetDescription = () => {
    switch (notification.target_type) {
      case 'individual':
        return `Targeted: ${notification.target_farmers?.length || 0} Specific Farmers`;
      case 'crop':
        return `Crop: ${notification.target_crop || 'N/A'}`;
      case 'livestock':
        return `Livestock: ${notification.target_livestock || 'N/A'}`;
      case 'region':
        return `Region: ${notification.target_region ? 
          (notification.target_region.charAt(0).toUpperCase() + notification.target_region.slice(1)) : 'N/A'}`;
      case 'district':
        return `District: ${notification.target_district || 'N/A'}`;
      default:
        return 'Broadcast: All Farmers';
    }
  };

  const hasNepaliTitle = notification.title_np && notification.title_np.trim() !== '';
  const hasNepaliMessage = notification.message_np && notification.message_np.trim() !== '';
  const hasNepali = hasNepaliTitle || hasNepaliMessage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogDescription className="sr-only">
          Notification details for {notification.title}
        </DialogDescription>
        
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xl">{typeIcons[notification.notification_type] || '📢'}</span>
                <Badge className={`${priorityColors[notification.priority] || 'bg-gray-100'} font-semibold`}>
                  {priorityIcons[notification.priority]} {notification.priority?.toUpperCase() || 'MEDIUM'}
                </Badge>
                <Badge className="bg-gray-800 text-white border-0 font-semibold">
                  {typeLabels[notification.notification_type] || 'Announce'}
                </Badge>
                {hasNepali && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-semibold flex items-center gap-1">
                    <Languages className="w-3 h-3" /> Bilingual
                  </Badge>
                )}
              </div>
              
              {/* English Title */}
              <div className="text-xl font-bold text-gray-900">
                {notification.title}
              </div>
              
              {/* Nepali Title - Always show if exists */}
              {hasNepaliTitle && (
                <div className="mt-1 text-lg font-semibold text-purple-700 border-l-4 border-purple-400 pl-3">
                  🇳🇵 {notification.title_np}
                </div>
              )}
            </div>
            {/* Close button removed here — DialogContent already renders its own built-in close (X) button */}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="space-y-6 p-1">
            {/* English Message */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>🇬🇧</span> Message (English)
              </h4>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Nepali Message - Always show if exists */}
            {hasNepaliMessage && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5" /> Message (नेपाली)
                </h4>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {notification.message_np}
                </p>
              </div>
            )}

            {/* Show note if only title has Nepali */}
            {hasNepaliTitle && !hasNepaliMessage && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Only the title is available in Nepali. The message is in English.
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Target Audience
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {getTargetDescription()}
                  </p>
                  {notification.target_type === 'individual' && notification.target_farmers?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 font-medium">Selected Farmers:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {notification.target_farmers.slice(0, 5).map((farmer, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {farmer.full_name || farmer.username || `#${farmer.id}`}
                          </Badge>
                        ))}
                        {notification.target_farmers.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{notification.target_farmers.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sent By
                  </h4>
                  <p className="text-sm text-gray-700 mt-1">
                    {notification.sent_by_name || notification.sent_by?.full_name || 'System Admin'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sent At
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(notification.sent_at)}
                  </p>
                </div>
                {notification.read_at && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Read At
                    </h4>
                    <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {formatDate(notification.read_at)}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email Notification
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {notification.send_email ? (
                      <span className="text-green-600 font-medium">Sent</span>
                    ) : (
                      <span className="text-gray-400">Not sent</span>
                    )}
                  </p>
                </div>
                {hasNepali && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Languages
                    </h4>
                    <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                      <Languages className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">English</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-purple-600">नेपाली</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">Read-Only View</h4>
                  <p className="text-sm text-amber-700">
                    This notification has already been sent and cannot be edited. 
                    All farmers have received this notification based on the target criteria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailModal;