import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import LocationSelector from '@/components/LocationSelector';
import { useAuth } from '@/lib/AuthContext';
import { userAPI } from '@/lib/apiService';
import { locationService } from '@/lib/locationService';
import { Save, Bell, Lock, Globe, Eye, EyeOff, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';

export default function Settings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(user?.locationId || null);
  const [locationDisplay, setLocationDisplay] = useState<string>('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's current location display
  useEffect(() => {
    const loadLocation = async () => {
      if (user?.locationId) {
        setSelectedLocationId(user.locationId);
        try {
          // Assuming locationId is Sector ID based on LocationSelector logic
          const sector = await locationService.getSectorById(user.locationId);
          if (sector) {
            setLocationDisplay(`${sector.name}${sector.districtName ? `, ${sector.districtName}` : ''}`);
          }
        } catch (err) {
          console.error('Failed to load location details', err);
          setLocationDisplay('Location set');
        }
      }
    };
    loadLocation();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLocationSelect = (locationId: number, sectorName?: string, districtName?: string) => {
    setSelectedLocationId(locationId);
    if (sectorName && districtName) {
      setLocationDisplay(`${sectorName}, ${districtName}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error(t('userNotAuthenticated'));
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {
        name: formData.fullName,
        email: formData.email,
      };

      // Add phone if provided
      if (formData.phone) {
        updateData.phone = formData.phone;
      }

      // Add location if selected
      if (selectedLocationId) {
        updateData.locationId = selectedLocationId;
      }

      await userAPI.updateOwnProfile(Number(user.id), updateData);
      toast.success('Profile updated successfully!');

      // Hide location selector after successful save
      setShowLocationSelector(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      await userAPI.changePassword(Number(user.id), {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Error updating password:', err);
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Profile Information</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </label>

            {/* Current Location Display */}
            {locationDisplay && !showLocationSelector && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Current Location</p>
                    <p className="text-sm text-blue-700">{locationDisplay}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationSelector(true)}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* No Location Set */}
            {!locationDisplay && !showLocationSelector && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-900">No location set</p>
                    <p className="text-xs text-yellow-700">Please set your location to create cases</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLocationSelector(true)}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Set Location
                  </button>
                </div>
              </div>
            )}

            {/* Location Selector */}
            {showLocationSelector && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Select Your Location</p>
                  <button
                    type="button"
                    onClick={() => setShowLocationSelector(false)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <LocationSelector
                  onLocationSelect={handleLocationSelect}
                  selectedCellId={selectedLocationId || undefined}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Account Type</label>
            <input
              type="text"
              value={user?.role.charAt(0).toUpperCase() + user?.role.slice(1) || 'User'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-muted-foreground"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="h-5 w-5" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Preferences
          </h2>

          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
              { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via SMS' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive app push notifications' },
              { key: 'weeklyReport', label: 'Weekly Reports', description: 'Get weekly summary reports' },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all">
                <div>
                  <p className="font-medium text-foreground">{pref.label}</p>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
                <button
                  onClick={() => handlePreferenceChange(pref.key)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${preferences[pref.key as keyof typeof preferences] ? 'bg-primary' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all ${preferences[pref.key as keyof typeof preferences] ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            Security
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="h-5 w-5" />
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-red-800">Danger Zone</h2>
          <p className="text-sm text-red-700">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="w-full px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}
