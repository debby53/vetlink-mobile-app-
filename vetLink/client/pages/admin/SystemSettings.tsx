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
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t('notificationSettings')}</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t('emailNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p>
              </div>
              <button
                onClick={() => toggleSetting('emailNotifications')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.emailNotifications
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {settings.emailNotifications ? t('enabled') : t('disabled')}
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t('securitySettings')}</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                <p className="font-medium text-foreground">{t('twoFactorAuth')}</p>
                <p className="text-sm text-muted-foreground">{t('twoFactorAuthDesc')}</p>
              </div>
              <button
                onClick={() => toggleSetting('twoFactorAuth')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.twoFactorAuth
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {settings.twoFactorAuth ? t('enabled') : t('disabled')}
              </button>
            </div>

            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                <p className="font-medium text-foreground">{t('sslEncryption')}</p>
                <p className="text-sm text-muted-foreground">{t('sslEncryptionDesc')}</p>
              </div>
              <button
                onClick={() => toggleSetting('enableSSL')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.enableSSL
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {settings.enableSSL ? t('enabled') : t('disabled')}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('maxLoginAttempts')}
              </label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting('maxLoginAttempts', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('lockAccountDesc')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('sessionTimeout')}
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('autoLogoutDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t('dbBackup')}</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                <p className="font-medium text-foreground">{t('autoBackup')}</p>
                <p className="text-sm text-muted-foreground">{t('autoBackupDesc')}</p>
              </div>
              <button
                onClick={() => toggleSetting('backupEnabled')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.backupEnabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {settings.backupEnabled ? t('enabled') : t('disabled')}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('backupFrequency')}
              </label>
              <select
                value={settings.autoBackupFrequency}
                onChange={(e) => updateSetting('autoBackupFrequency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="hourly">{t('everyHour')}</option>
                <option value="daily">{t('daily')}</option>
                <option value="weekly">{t('weekly')}</option>
                <option value="monthly">{t('monthly')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('dataRetention')}
              </label>
              <input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => updateSetting('dataRetention', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('deleteLogsDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{t('systemConfig')}</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                <p className="font-medium text-foreground">{t('maintenanceMode')}</p>
                <p className="text-sm text-muted-foreground">{t('maintenanceModeDesc')}</p>
              </div>
              <button
                onClick={() => toggleSetting('maintenanceMode')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.maintenanceMode
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {settings.maintenanceMode ? t('enabled') : t('disabled')}
              </button>
            </div>

            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                <p className="font-medium text-foreground">{t('apiAccess')}</p>
                <p className="text-sm text-muted-foreground">{t('apiAccessDesc')}</p>
              </div>
              <button
                onClick={() => toggleSetting('enableAPI')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${settings.enableAPI
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}
              >
                {settings.enableAPI ? t('enabled') : t('disabled')}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('logLevel')}
              </label>
              <select
                value={settings.logLevel}
                onChange={(e) => updateSetting('logLevel', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {t('logLevelDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {changed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <Eye className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              {t('unsavedChanges')}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={saveSettings}
            disabled={!changed}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('saveChanges')}
          </button>
          <button
            onClick={resetSettings}
            disabled={!changed}
            className="flex-1 px-4 py-3 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}
