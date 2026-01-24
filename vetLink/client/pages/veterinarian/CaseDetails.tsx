import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { caseAPI, animalAPI, healthRecordAPI, userAPI, CaseDTO, AnimalDTO, UserDTO } from '@/lib/apiService';
import CaseMediaPreview from '@/components/CaseMediaPreview';
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function VeterinarianCaseDetails() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState<CaseDTO | null>(null);
  const [animalData, setAnimalData] = useState<AnimalDTO | null>(null);
  const [farmerData, setFarmerData] = useState<UserDTO | null>(null);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);

  useEffect(() => {
    if (caseId) {
      loadCaseDetails();
    }
  }, [caseId]);

  const loadCaseDetails = async () => {
    setIsLoading(true);
    const loadingToastId = toast.loading('Loading case details...');

    try {
      if (!caseId) {
        console.error('❌ Case ID not found');
        toast.dismiss(loadingToastId);
        toast.error('Case ID not found');
        setIsLoading(false);
        return;
      }

      console.log('🔄 Loading case details for ID:', caseId);

      // Load case data
      console.log('🔄 Fetching case data...');
      const _caseData: CaseDTO = await Promise.race([
        caseAPI.getCaseById(Number(caseId)),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Case load timeout')), 15000))
      ]);
      console.log('✅ Case data loaded:', _caseData);

      if (!_caseData) {
        console.error('❌ Case data is null or undefined');
        toast.dismiss(loadingToastId);
        toast.error('Failed to load case - received empty response');
        setIsLoading(false);
        return;
      }

      setCaseData(_caseData);

      // Load farmer details if available
      if (_caseData.farmerId) {
        try {
          console.log('🔄 Fetching farmer details...');
          const _farmerData: UserDTO = await userAPI.getUserById(_caseData.farmerId);
          console.log('✅ Farmer data loaded:', _farmerData);
          setFarmerData(_farmerData);
        } catch (farmerErr) {
          console.warn('⚠️ Failed to load farmer details:', farmerErr);
        }
      }

      toast.dismiss(loadingToastId);
      toast.success('Case loaded successfully');
      setIsLoading(false);

      // Load animal details in background
      if (_caseData.animalId) {
        try {
          console.log('🔄 Fetching animal details...');
          const _animalData: AnimalDTO = await animalAPI.getAnimalById(_caseData.animalId);
          console.log('✅ Animal data loaded:', _animalData);
          setAnimalData(_animalData);

          // Load health records for the animal
          const records = await healthRecordAPI.getHealthRecordsByAnimalId(_caseData.animalId);
          console.log('✅ Health records loaded:', records);
          setHealthRecords(records || []);
        } catch (animalErr) {
          console.warn('⚠️ Failed to load animal details:', animalErr);
        }
      }

      // Load media in background
      try {
        console.log('🔄 Fetching media...');
        const mediaList: any[] = await Promise.race([
          caseAPI.getMediaByCase(Number(caseId)),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Media load timeout')), 8000))
        ]);
        console.log('✅ Media loaded:', mediaList);
        if (mediaList && mediaList.length > 0) {
          setMedia(mediaList);
        }
      } catch (mediaErr) {
        console.warn('⚠️ Failed to load media:', mediaErr);
      }
    } catch (err) {
      console.error('❌ Error loading case details:', err);
      toast.dismiss(loadingToastId);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error details:', errorMsg);
      toast.error('Failed to load case: ' + errorMsg);
      setIsLoading(false);
    }
  };

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim() || !treatment.trim()) {
      toast.error('Please enter both diagnosis and treatment');
      return;
    }

    setIsSubmittingDiagnosis(true);
    try {
      await caseAPI.markCaseAsCompleted(Number(caseId), {
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
      } as any);
      toast.success('Case completed and farmer notified');
      setDiagnosis('');
      setTreatment('');
      // Reload case details
      await loadCaseDetails();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit diagnosis');
    } finally {
      setIsSubmittingDiagnosis(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-100 text-red-800';
    if (severity >= 5) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED':
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading case details...</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-gray-400 text-white rounded-lg text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!caseData) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The case you're looking for doesn't exist or couldn't be loaded.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-green-600 font-semibold">Case</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">{caseData.title}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(caseData.status)}`}>
                  {caseData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('created')}</p>
            <p className="font-semibold text-foreground">{new Date(caseData.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('lastUpdated')}</p>
            <p className="font-semibold text-foreground">{new Date(caseData.updatedAt || caseData.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('caseId')}</p>
            <p className="font-semibold text-foreground">CASE-{caseData.id}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('type')}</p>
            <p className="font-semibold text-foreground">{caseData.caseType}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            {['overview', 'farmer', 'animal', 'treatment', 'media', 'timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 font-medium text-sm capitalize border-b-2 transition-colors ${activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t(tab) || tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-bold text-foreground mb-4">{t('caseOverview')}</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('mainIssue')}</p>
                    <p className="font-semibold text-foreground">{caseData.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('severity')}</p>
                    <p className="font-semibold text-foreground">Level {caseData.severity}/10</p>
                  </div>
                </div>
              </div>

              {caseData.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">{t('caseDetails')}</p>
                    <p className="text-sm text-blue-800 mt-1">{caseData.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Farmer Tab */}
          {activeTab === 'farmer' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-foreground mb-6">{t('farmerInformation')}</h2>
              {farmerData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('name')}</p>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {farmerData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('email')}</p>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {farmerData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('role')}</p>
                      <p className="font-semibold text-foreground capitalize">{farmerData.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('joinDate')}</p>
                      <p className="font-semibold text-foreground">
                        {farmerData.createdAt ? new Date(farmerData.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No farmer information available</p>
              )}
            </div>
          )}

          {/* Animal Tab */}
          {activeTab === 'animal' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-foreground mb-6">{t('animalInformation')}</h2>
              {animalData ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('animalName')}</p>
                      <p className="font-semibold text-foreground">{animalData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('type')}</p>
                      <p className="font-semibold text-foreground">{animalData.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('breed')}</p>
                      <p className="font-semibold text-foreground">{animalData.breed || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('age')}</p>
                      <p className="font-semibold text-foreground">{animalData.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('gender')}</p>
                      <p className="font-semibold text-foreground capitalize">{animalData.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('healthStatus')}</p>
                      <p className="font-semibold text-foreground capitalize">{animalData.healthStatus}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No animal information available</p>
              )}
            </div>
          )}

          {/* Treatment/Diagnosis Tab */}
          {activeTab === 'treatment' && (
            <div className="space-y-6">
              {/* Existing Treatments */}
              {healthRecords && healthRecords.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-bold text-foreground mb-4">Health Records</h2>
                  <div className="space-y-4">
                    {healthRecords.map((record: any) => (
                      <div key={record.id} className="border-l-4 border-green-500 pl-4 py-2">
                        <p className="font-semibold text-foreground">{record.recordType}</p>
                        <p className="text-sm text-muted-foreground">{record.details || record.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Diagnosis Form */}
              {caseData.status !== 'COMPLETED' && caseData.status !== 'RESOLVED' && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-bold text-foreground mb-4">Add Diagnosis & Treatment</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Diagnosis</label>
                      <textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter your diagnosis..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Treatment Plan</label>
                      <textarea
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        placeholder="Enter treatment recommendations..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={4}
                      />
                    </div>
                    <button
                      onClick={handleSubmitDiagnosis}
                      disabled={isSubmittingDiagnosis || !diagnosis.trim() || !treatment.trim()}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingDiagnosis ? 'Submitting...' : 'Submit Diagnosis & Complete Case'}
                    </button>
                  </div>
                </div>
              )}

              {/* Case Completed Message */}
              {(caseData.status === 'COMPLETED' || caseData.status === 'RESOLVED') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Case Completed</p>
                    <p className="text-sm text-green-800 mt-1">
                      This case has been completed and the farmer has been notified.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-foreground mb-6">{t('caseMedia')}</h2>
              {media && media.length > 0 ? (
                <CaseMediaPreview media={media} caseId={Number(caseId)} />
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">No media files attached to this case</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-foreground mb-6">{t('timeline')}</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <div className="w-1 h-20 bg-gray-200 mt-2"></div>
                  </div>
                  <div className="pb-8">
                    <p className="font-semibold text-foreground">Case Created</p>
                    <p className="text-sm text-muted-foreground">{new Date(caseData.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {healthRecords.map((record: any, index: number) => (
                  <div key={record.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      {index < healthRecords.length - 1 && <div className="w-1 h-20 bg-gray-200 mt-2"></div>}
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-foreground">{record.recordType}</p>
                      <p className="text-sm text-muted-foreground">{new Date(record.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                {(caseData.status === 'COMPLETED' || caseData.status === 'RESOLVED') && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Case Completed</p>
                      <p className="text-sm text-muted-foreground">{new Date(caseData.updatedAt || caseData.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
