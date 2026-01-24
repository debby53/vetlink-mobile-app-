import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import LocationSelector from '@/components/LocationSelector';
import CaseMediaUpload from '@/components/CaseMediaUpload';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  Upload,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { caseAPI, animalAPI } from '@/lib/apiService';
import { toast } from 'sonner';

export default function NewCase() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    animalId: '',
    issue: '',
    duration: '',
    severity: 'medium',
    cellId: '',
    description: '',
    attachments: [] as File[],
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animals, setAnimals] = useState<any[]>([]);
  const [caseId, setCaseId] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (cellId: number) => {
    setFormData(prev => ({ ...prev, cellId: cellId.toString() }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cellId) {
      toast.error('Please select a location');
      return;
    }
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      // Map severity values to numeric scale
      const severityMap: { [key: string]: number } = {
        low: 2.5,
        medium: 5,
        high: 7.5,
        critical: 10,
      };

      // Find the animal from selected animal
      const selectedAnimal = animals.find(a => a.id.toString() === formData.animalId);
      if (!selectedAnimal) {
        toast.error('Please select a valid animal');
        setIsSubmitting(false);
        return;
      }

      const newCase = await caseAPI.createCase({
        farmerId: user.id,
        animalId: parseInt(formData.animalId),
        title: formData.issue,
        description: formData.description,
        caseType: selectedAnimal.type,
        severity: severityMap[formData.severity] || 5,
        locationId: parseInt(formData.cellId),
        status: 'OPEN',
      });

      setCaseId(newCase.id);
      toast.success('Case created successfully');
      setStep(3);
    } catch (err: any) {
      console.error('Error creating case:', err);
      toast.error(err.message || 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Complete = formData.animalId;
  const isStep2Complete = formData.issue && formData.duration && formData.severity;

  useEffect(() => {
    loadAnimals();
  }, [user?.id]);

  const loadAnimals = async () => {
    if (!user?.id) return;
    try {
      const farmerAnimals = await animalAPI.getAnimalsByFarmerId(user.id);
      setAnimals(farmerAnimals);
    } catch (err: any) {
      console.error('Error loading animals:', err);
      toast.error('Failed to load animals');
    }
  };

  const getStepLabel = (stepNum: number) => {
    switch (stepNum) {
      case 1: return t('stepAnimalDetails');
      case 2: return t('stepIssueDetails');
      case 3: return t('stepReview');
      default: return '';
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('reportNewCase')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('reportCaseSubtitle')}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-3 ${step >= s ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= s ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                {s}
              </div>
              <span className="font-medium text-foreground hidden sm:inline">{getStepLabel(s)}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar Lines */}
        <div className="relative h-1 bg-gray-200 mt-2 mb-6 sm:hidden">
          <div
            className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Animal Details */}
          {step === 1 && (
            <div className="bg-white p-8 rounded-lg border border-gray-200 space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t('stepAnimalDetails')}</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('selectAnimal')} *
                </label>
                <select
                  name="animalId"
                  value={formData.animalId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                >
                  <option value="">{t('selectAnimal')}</option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} - {animal.type} {animal.age ? `(${animal.age} years)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/farmer/cases')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Complete}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Issue Details */}
          {step === 2 && (
            <div className="bg-white p-8 rounded-lg border border-gray-200 space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t('stepIssueDetails')}</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('mainIssue')} *
                </label>
                <input
                  type="text"
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  placeholder={t('issuePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('duration')} *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                  >
                    <option value="">{t('selectType')}</option>
                    <option value="less-than-24h">{t('lessThan24h')}</option>
                    <option value="1-3-days">{t('oneToThreeDays')}</option>
                    <option value="3-7-days">{t('threeToSevenDays')}</option>
                    <option value="more-than-week">{t('moreThanWeek')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('severity')} *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="low">{t('low')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="high">{t('high')}</option>
                    <option value="critical">{t('critical')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('detailedDescription')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('describeObservation')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('locationAnimal')} *
                </label>
                <LocationSelector 
                  onLocationSelect={handleLocationSelect}
                  selectedCellId={formData.cellId ? parseInt(formData.cellId) : undefined}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-3">📸 {t('uploadMedia') || 'Upload Photos or Videos'}</p>
                <p className="text-xs text-blue-800 mb-4">
                  {t('mediaDescription') || 'Attach photos or videos of the animal to help with diagnosis. This will be added after case creation.'}
                </p>
                <div className="text-xs text-blue-700">
                  <p>✓ Supported: Images (JPG, PNG, GIF, WebP) & Videos (MP4, MOV, AVI, WebM)</p>
                  <p>✓ Max size: 100MB per file</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
                >
                  {t('back')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!isStep2Complete}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Media Upload & Review */}
          {step === 3 && (
            <div className="bg-white p-8 rounded-lg border border-gray-200 space-y-6">
              <h2 className="text-xl font-bold text-foreground">
                {caseId ? '✅ Case Created Successfully!' : t('stepReview')}
              </h2>

              {caseId ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900">Your case has been created!</p>
                    <p className="text-sm text-green-800 mt-2">Case ID: CASE-{caseId}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">📸 Add Photos or Videos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Now you can upload photos and videos related to this case to help with diagnosis.
                    </p>
                    <CaseMediaUpload
                      caseId={caseId}
                      onMediaUpload={(media) => {
                        toast.success('Media uploaded successfully');
                      }}
                      onError={(error) => {
                        toast.error(error);
                      }}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/farmer/cases')}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                    >
                      Go to My Cases
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900">{t('animalInformation')}</p>
                      <div className="mt-3 space-y-2 text-sm text-green-800">
                        <p><strong>{t('animal')}:</strong> {animals.find(a => a.id.toString() === formData.animalId)?.name}</p>
                        <p><strong>{t('type')}:</strong> {animals.find(a => a.id.toString() === formData.animalId)?.type}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900">{t('stepIssueDetails')}</p>
                      <div className="mt-3 space-y-2 text-sm text-blue-800">
                        <p><strong>{t('mainIssue')}:</strong> {formData.issue}</p>
                        <p><strong>{t('duration')}:</strong> {t(formData.duration) || formData.duration}</p>
                        <p><strong>{t('severity')}:</strong> {t(formData.severity) || formData.severity}</p>
                      </div>
                    </div>

                    {formData.description && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-purple-900">{t('detailedDescription')}</p>
                        <p className="mt-2 text-sm text-purple-800">{formData.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">{t('quickResponse')}</p>
                      <p className="text-sm text-blue-800 mt-1">
                        {t('quickResponseText')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
                    >
                      {t('back')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating...' : t('submitCase')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </SidebarLayout>
  );
}
