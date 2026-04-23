import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useNotifications } from '@/lib/NotificationContext';
import { useAuth } from '@/lib/AuthContext';
import { Bell, Trash2, Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth() as any;
  const { notifications, isLoading, markAsRead, deleteNotification, markAllAsRead, deleteAllNotifications, fetchNotifications } = useNotifications();

  // Fetch notifications on component mount
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  const handleMarkAsRead = (id: number | undefined) => {
    if (id) {
      markAsRead(id);
      toast.success('Marked as read');
    }
  };

  const handleDelete = (id: number | undefined) => {
    if (id) {
      deleteNotification(id);
      toast.info('Notification deleted');
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      deleteAllNotifications();
      toast.info('All notifications deleted');
    }
  };

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
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            {t('notifications') || 'Notifications'}
          </h1>
          <p className="text-muted-foreground">
            {t('manageNotifications') || 'Manage and track all your alerts and updates'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium text-sm flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {t('markAllAsRead') || 'Mark All Read'}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all font-medium text-sm flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t('deleteAll') || 'Delete All'}
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
              <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">{t('noNotifications') || 'No notifications yet'}</p>
            <p className="text-muted-foreground text-sm mt-2">
              {t('notificationsWillAppearHere') || 'Notifications will appear here when you receive them'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border-l-4 ${getBackgroundColor(
                  notif.type
                )} transition-all ${
                  !notif.isRead ? 'border-l-primary font-medium shadow-md' : 'border-l-gray-200'
                }`}
              >
                <div className="flex gap-4 items-start">
                  {getIcon(notif.type)}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {notif.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleString()
                        : 'Just now'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4 text-blue-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                      title="Delete notification"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {notifications.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-primary">
                {notifications.filter(n => !n.isRead).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{t('unread') || 'Unread'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-red-500">
                {notifications.filter(n => n.type === 'ALERT').length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{t('alerts') || 'Alerts'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {notifications.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{t('total') || 'Total'}</p>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
