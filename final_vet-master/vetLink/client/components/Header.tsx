import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Bell,
  Globe,
  LogIn,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const languageOptions = [
    { code: 'en' as const, label: 'English' },
    { code: 'kinyarwanda' as const, label: 'Kinyarwanda' },
    { code: 'fr' as const, label: 'Français' },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo & Branding */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="VetLink Logo" className="h-8 w-auto object-contain" />
          <span className="font-bold text-lg text-foreground hidden sm:block">VetLink</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector (visible to everyone) */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1 group"
            >
              <Globe className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium hidden lg:block">{language.substring(0, 2).toUpperCase()}</span>
              <ChevronDown className="h-4 w-4 text-foreground" />
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => {
                      setLanguage(option.code);
                      setShowLanguageMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-green-50 hover:text-green-600 transition-all font-medium text-sm first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option.code === 'en' ? t('english') : option.code === 'kinyarwanda' ? t('kinyarwanda') : t('french')}
                    {language === option.code && (
                      <Check className="h-4 w-4 ml-auto text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user && (
            <>
              {/* Notifications */}
              <NotificationBell />



              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden lg:block truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-foreground" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role === 'veterinarian' ? 'Veterinarian' : user.role}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-green-50 hover:text-green-600 transition-all font-medium text-sm"
                    >
                      <Menu className="h-4 w-4" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-green-50 hover:text-green-600 transition-all font-medium text-sm"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm rounded-b-lg"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
            >
              <LogIn className="h-4 w-4" />
              {t('signIn')}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
        >
          {showMobileMenu ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="flex flex-col divide-y divide-gray-100 p-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavigate('/notifications')}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Bell className="h-5 w-5" />
                  <span>{t('notifications')}</span>
                </button>

                <button
                  onClick={() => handleNavigate('/settings')}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Settings className="h-5 w-5" />
                  <span>{t('settings')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <LogIn className="h-5 w-5" />
                  <span>{t('signIn')}</span>
                </button>

                <button
                  onClick={() => handleNavigate('/signup')}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Check className="h-5 w-5" />
                  <span>{t('signUp')}</span>
                </button>
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Globe className="h-5 w-5" />
                <span>{t('language')}</span>
              </button>

              {showLanguageMenu && (
                <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => {
                        setLanguage(option.code);
                        setShowLanguageMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-green-50 hover:text-green-600 transition-all font-medium text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option.code === 'en' ? t('english') : option.code === 'kinyarwanda' ? t('kinyarwanda') : t('french')}
                      {language === option.code && (
                        <Check className="h-4 w-4 ml-auto text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span>{t('logout')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
