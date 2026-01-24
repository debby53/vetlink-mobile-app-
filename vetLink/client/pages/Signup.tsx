import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage, Language } from '@/lib/LanguageContext';
import LocationSelector from '@/components/LocationSelector';
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  Globe,
  ChevronDown,
  Check,
  User,
  MapPin,
  Shield,
  Stethoscope,
  BookOpen,
  Sprout,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showSignupLangMenu, setShowSignupLangMenu] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [role, setRole] = useState<'farmer' | 'veterinarian' | 'cahw'>('farmer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    licenseNumber: '',
  });

  // Location State
  const [locationState, setLocationState] = useState<{
    id: number | null;
    sector: string;
    district: string;
  }>({ id: null, sector: '', district: '' });

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleLocationSelect = (id: number, sectorName?: string, districtName?: string) => {
    setLocationState({
      id,
      sector: sectorName || '',
      district: districtName || ''
    });
    setError('');
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Role
        return true;
      case 2: // Personal
        if (!formData.name) return 'Full name is required';
        if (!formData.email) return 'Email is required';
        // Phone optional
        return true;
      case 3: // Location
        // Required for Vets/CAHWs based on old logic, but generally good for all
        if (!locationState.id) return 'Please select your location';
        return true;
      case 4: // Professional (Vet only) or Security
        if (role === 'veterinarian') {
          // Check professional details if we are on that step
          // Wait, step numbering depends on role. 
          // Let's handle logic dynamically.
          return true;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    const errorMsg = validateStep(currentStep);
    if (typeof errorMsg === 'string') {
      setError(errorMsg);
      return;
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsMismatch'));
      return;
    }
    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        role,
        locationState.id!,
        locationState.sector,
        locationState.district,
        formData.phone,
        formData.specialization,
        formData.licenseNumber
      );
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || t('signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Determine total steps based on role
  const totalSteps = role === 'veterinarian' ? 5 : 4;
  /*
    Steps:
    1. Role Selection
    2. Personal Info (Name, Email, Phone)
    3. Location
    4. Professional (Vet Only)
    5. Security (Password) -> Submit
  */

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">I am a...</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'farmer', label: 'Farmer', icon: Sprout, desc: 'Manage my farm & animals' },
                { id: 'veterinarian', label: 'Veterinarian', icon: Stethoscope, desc: 'Treat animals & manage cases' },
                { id: 'cahw', label: 'CAHW', icon: Briefcase, desc: 'Community health worker' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id as any)}
                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all text-left group ${isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-100 bg-white hover:border-primary/50 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`p-3 rounded-full mr-4 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isSelected ? 'text-primary' : 'text-slate-900'}`}>{item.label}</h3>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute right-4 text-primary">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateForm('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => updateForm('email', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional but Recommended)</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
                  +250
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => updateForm('phone', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="780 000 000"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Required for OTP Login</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Where are you located?</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <LocationSelector
                onLocationSelect={handleLocationSelect}
                label="Search for your Sector"
              />
            </div>
            {locationState.sector && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <MapPin className="w-4 h-4" />
                Selected: {locationState.sector}, {locationState.district}
              </div>
            )}
          </div>
        );

      case 4:
        if (role === 'veterinarian') {
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={e => updateForm('specialization', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Surgery, Cattle, General"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={e => updateForm('licenseNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="VET-2024-XXX"
                />
              </div>
            </div>
          );
        } else {
          // If not vet, Step 4 is Security (Password) - see logic below
          // Actually, simplest way is to handle "Security" as the LAST step index.
          // If role != vet, totalSteps is 4. So Step 4 IS Security.
          return renderSecurityStep();
        }

      case 5:
        // Only reachable if role == veterinarian
        return renderSecurityStep();

      default:
        return null;
    }
  };

  const renderSecurityStep = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold mb-4">Secure your account</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={e => updateForm('password', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={e => updateForm('confirmPassword', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p>Your data is processed securely. By creating an account, you agree to our Terms of Service.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* Left Side: Visual & Progress */}
        <div className="bg-primary p-8 md:w-1/3 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-8 opacity-90 hover:opacity-100 transition-opacity">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
              <span className="font-bold text-xl">VetLink</span>
            </Link>
            <h1 className="text-3xl font-bold mb-4">Join our community</h1>
            <p className="text-primary-foreground/80">Connect with veterinarians, manage your farm, and improve animal health.</p>
          </div>

          {/* Stepper Dots */}
          <div className="relative z-10 flex gap-2 mt-8 md:mt-0">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${currentStep > idx + 1 ? 'w-4 bg-white' :
                    currentStep === idx + 1 ? 'w-8 bg-white' : 'w-2 bg-white/30'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-2/3 p-8 md:p-12 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setShowSignupLangMenu(!showSignupLangMenu)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <div className="text-sm text-slate-500">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Language Menu */}
          {showSignupLangMenu && (
            <div className="absolute top-20 right-12 md:right-16 w-32 bg-white border border-slate-100 rounded-lg shadow-lg z-50 py-1">
              {[{ code: 'en', label: 'English' }, { code: 'kinyarwanda', label: 'Kinyarwanda' }, { code: 'fr', label: 'Français' }].map(opt => (
                <button
                  key={opt.code}
                  onClick={() => { setLanguage(opt.code as Language); setShowSignupLangMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                >
                  {opt.label}
                  {language === opt.code && <Check className="w-3 h-3 text-green-600" />}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1">
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <div className="shrink-0 mt-0.5">⚠️</div>
                {error}
              </div>
            )}

            {renderStep()}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-slate-600 font-medium hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div /> /* Spacer */
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 bg-primary text-white font-medium px-8 py-2.5 rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                {!isLoading && <Check className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
