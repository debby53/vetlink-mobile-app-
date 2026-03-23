import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage, Language } from '@/lib/LanguageContext';
import { Eye, EyeOff, ArrowRight, Globe, ChevronDown, Check, Smartphone, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithPhone, verifyOtp } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLoginLangMenu, setShowLoginLangMenu] = useState(false);

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Flow State
  const [step, setStep] = useState<'input' | 'password' | 'otp'>('input');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine input type
  const isPhone = useMemo(() => {
    // Basic check for phone number (digits, potentially starting with +)
    return /^(\+?\d{8,})$/.test(identifier.replace(/\s/g, ''));
  }, [identifier]);

  const isEmail = useMemo(() => {
    return /\S+@\S+\.\S+/.test(identifier);
  }, [identifier]);

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      setError(t('fillAllFields'));
      return;
    }

    if (isPhone) {
      // Phone flow -> Send OTP
      setIsLoading(true);
      try {
        await loginWithPhone(identifier);
        setStep('otp');
      } catch (err: any) {
        setError(err.message || t('failedToSendCode'));
      } finally {
        setIsLoading(false);
      }
    } else if (isEmail) {
      // Email flow -> Ask Password
      setStep('password');
    } else {
      setError(t('validIdentifier'));
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!password) {
        setError(t('fillAllFields'));
        return;
      }
      // Role is ignored by backend for existing users, but required by method signature
      await login(identifier, password, 'user');
      navigate('/dashboard');
    } catch (err: any) {
      setError(t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!otp) {
        setError(t('enterVerificationCode'));
        return;
      }
      await verifyOtp(identifier, otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || t('invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setPassword('');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="VetLink Logo" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg text-foreground hidden sm:block">VetLink</span>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLoginLangMenu(!showLoginLangMenu)}
              className="p-2 rounded-lg border border-border bg-white flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm">{language.substring(0, 2).toUpperCase()}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showLoginLangMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-border rounded-lg shadow-lg z-50">
                {[{ code: 'en', label: t('english') }, { code: 'kinyarwanda', label: t('kinyarwanda') }, { code: 'fr', label: t('french') }].map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => { setLanguage(opt.code as Language); setShowLoginLangMenu(false); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-100"
                  >
                    <span>{opt.label}</span>
                    {language === opt.code && <Check className="h-4 w-4 text-green-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-foreground">{t('signIn')}</h1>
              <p className="text-muted-foreground">{t('welcomeBackLogin')}</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {step === 'input' && (
              <form onSubmit={handleIdentifierSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('emailOrPhone')}
                  </label>
                  <div className="relative">
                    {/* Dynamic Icon */}
                    {isPhone ? (
                      <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-all" />
                    ) : (
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground transition-all" />
                    )}
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={t('identifierPlaceholder')}
                      className="w-full pl-10 rounded-lg border border-border bg-white px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('continue')}
                  {!isLoading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{identifier}</span>
                  <button type="button" onClick={handleReset} className="text-sm text-primary hover:underline">{t('change')}</button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 rounded-lg border border-border bg-white px-4 py-2 pr-10 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    {t('forgotPassword')}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('signIn')}
                  {!isLoading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{identifier}</span>
                  <button type="button" onClick={handleReset} className="text-sm text-primary hover:underline">{t('change')}</button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t('verificationCode')}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t('enterCodePlaceholder')}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-center tracking-widest text-lg"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    {t('otpSent')}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('verifyAndLogin')}
                  {!isLoading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                {t('signUp')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
