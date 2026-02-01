import { useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { Settings as SettingsIcon, ShieldAlert, Database, Bell, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettings() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    twoFactorAuth: true,
    maintenanceMode: false,
    backupEnabled: true,
    autoBackupFrequency: 'daily',
    dataRetention: '90',
    maxLoginAttempts: '5',
    sessionTimeout: '30',
    enableAPI: true,
    enableSSL: true,
    logLevel: 'info',
  });

  const [changed, setChanged] = useState(false);

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setChanged(true);
  };

  const updateSetting = (key: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setChanged(true);
  };

  const saveSettings = () => {
    toast.success('System settings updated successfully');
    setChanged(false);
  };

  const resetSettings = () => {
    setChanged(false);
    toast.info('Changes discarded');
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            {t('systemSettings') || 'System Settings'}
          </h1>
          <p className="text-muted-foreground">
            {t('systemWideSettingsSubtitle')}
          </p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('notificationSettings')}</h2>
              <p className="text-sm text-muted-foreground">Manage how the system communicates</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-2xl">
                <p className="font-medium text-foreground">{t('emailNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc') || 'Send automated emails for system alerts'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => toggleSetting('emailNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('securitySettings')}</h2>
              <p className="text-sm text-muted-foreground">Protect access and data integrity</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex-1 max-w-2xl">
                <p className="font-medium text-foreground">{t('twoFactorAuth')}</p>
                <p className="text-sm text-muted-foreground">{t('twoFactorAuthDesc') || 'Require 2FA for all admin accounts'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => toggleSetting('twoFactorAuth')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex-1 max-w-2xl">
                <p className="font-medium text-foreground">{t('sslEncryption')}</p>
                <p className="text-sm text-muted-foreground">{t('sslEncryptionDesc') || 'Enforce HTTPS for all connections'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.enableSSL}
                  onChange={() => toggleSetting('enableSSL')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('maxLoginAttempts') || 'Max Login Attempts'}
                </label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => updateSetting('maxLoginAttempts', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('lockAccountDesc') || 'Account locks after N failed attempts'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('sessionTimeout') || 'Session Timeout (minutes)'}
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('autoLogoutDesc') || 'Auto-logout inactive users'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Database className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('dbBackup')}</h2>
              <p className="text-sm text-muted-foreground">Backup and data retention policies</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex-1 max-w-2xl">
                <p className="font-medium text-foreground">{t('autoBackup')}</p>
                <p className="text-sm text-muted-foreground">{t('autoBackupDesc') || 'Automatically backup database'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.backupEnabled}
                  onChange={() => toggleSetting('backupEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('backupFrequency')}
                </label>
                <select
                  value={settings.autoBackupFrequency}
                  onChange={(e) => updateSetting('autoBackupFrequency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="hourly">{t('everyHour')}</option>
                  <option value="daily">{t('daily')}</option>
                  <option value="weekly">{t('weekly')}</option>
                  <option value="monthly">{t('monthly')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('dataRetention') || 'Log Retention (days)'}
                </label>
                <input
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting('dataRetention', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('deleteLogsDesc') || 'Auto-delete logs older than X days'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Config */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-rose-100 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('systemConfig')}</h2>
              <p className="text-sm text-muted-foreground">Advanced system controls</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex-1 max-w-2xl">
                <p className="font-medium text-foreground">{t('maintenanceMode')}</p>
                <p className="text-sm text-muted-foreground">{t('maintenanceModeDesc') || 'Prevent non-admin access during updates'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={() => toggleSetting('maintenanceMode')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex-1 max-w-2xl">
                <p className="font-medium text-foreground">{t('apiAccess')}</p>
                <p className="text-sm text-muted-foreground">{t('apiAccessDesc') || 'Enable external API endpoints'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.enableAPI}
                  onChange={() => toggleSetting('enableAPI')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('logLevel')}
              </label>
              <select
                value={settings.logLevel}
                onChange={(e) => updateSetting('logLevel', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {t('logLevelDesc') || 'Verbosity of system logs'}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className={`sticky bottom-6 z-10 transition-all transform ${changed ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t('unsavedChanges') || 'Unsaved Changes'}</p>
                <p className="text-sm text-muted-foreground">You have modifications that haven't been saved.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetSettings}
                className="px-6 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={saveSettings}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
