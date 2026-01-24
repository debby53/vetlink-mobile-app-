import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '@/lib/NotificationContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [displayNotifications, setDisplayNotifications] = useState(notifications.slice(0, 5));

  useEffect(() => {
    setDisplayNotifications(notifications.slice(0, 5));
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'WARNING':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'INFO':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'SUCCESS':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'ALERT':
        return 'bg-red-50 hover:bg-red-100 border-red-200';
      case 'WARNING':
        return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
      case 'INFO':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'SUCCESS':
        return 'bg-green-50 hover:bg-green-100 border-green-200';
      default:
        return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-all group"
        title={t('notifications') || 'Notifications'}
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {t('notifications') || 'Notifications'}
        </span>
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t('notifications') || 'Notifications'}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                  title="Mark all as read"
                >
                  {t('markAllAsRead') || 'Mark All Read'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {displayNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {t('noNotifications') || 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-l-4 ${getBackgroundColor(
                    notif.type
                  )} transition-all cursor-pointer hover:shadow-sm ${
                    !notif.isRead ? 'border-l-primary font-medium' : 'border-l-gray-200'
                  }`}
                  onClick={() => !notif.isRead && notif.id && markAsRead(notif.id)}
                >
                  <div className="flex gap-3 items-start">
                    {getIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {notif.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleString()
                          : 'Just now'}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        notif.id && deleteNotification(notif.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-all flex-shrink-0 opacity-0 hover:opacity-100"
                      title="Delete"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
              <a
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {t('viewAll') || 'View All Notifications'}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
