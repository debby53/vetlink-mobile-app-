import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { caseAPI, animalAPI, healthRecordAPI } from '@/lib/apiService';
import CaseMediaUpload from '@/components/CaseMediaUpload';
import CaseMediaPreview from '@/components/CaseMediaPreview';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Share2,
  Download,
  Calendar,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function ViewDetails() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: caseId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [animalData, setAnimalData] = useState<any>(null);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      // Load case data first (essential) with timeout
      console.log('🔄 Fetching case data...');
      const _caseData = await Promise.race([
        caseAPI.getCaseById(Number(caseId)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Case load timeout')), 15000))
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

      // Set loading to false immediately after case data is loaded
      toast.dismiss(loadingToastId);
      toast.success('Case loaded successfully');
      setIsLoading(false);

      // Load animal details in background
      if (_caseData.animalId) {
        try {
          console.log('🔄 Fetching animal details...');
          const _animalData = await animalAPI.getAnimalById(_caseData.animalId);
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

      // Load media in background with timeout
      try {
        console.log('🔄 Fetching media...');
        const mediaList = await Promise.race([
          caseAPI.getMediaByCase(Number(caseId), user?.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Media load timeout')), 8000))
        ]);
        console.log('✅ Media loaded:', mediaList);
        if (mediaList && mediaList.length > 0) {
          setMedia(mediaList);
        }
      } catch (mediaErr) {
        console.warn('⚠️ Failed to load media:', mediaErr);
        if (_caseData.media) {
          setMedia(_caseData.media);
        }
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

  const handleDelete = async () => {
    try {
      if (!caseId) {
        toast.error('Case ID not found');
        return;
      }

      await caseAPI.deleteCase(Number(caseId));
      toast.success('Case deleted successfully');
      navigate(-1);
    } catch (err) {
      console.error('Error deleting case:', err);
      toast.error('Failed to delete case');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
      case 'low':
        return 'bg-green-100 text-green-800';
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
            <p className="text-muted-foreground">Case not found</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
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

          {/* Actions */}
          <div className="flex gap-2">
            <button className="p-3 hover:bg-gray-100 rounded-lg transition-all" title={t('edit')}>
              <Edit2 className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg transition-all" title={t('share')}>
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg transition-all" title={t('download')}>
              <Download className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-3 hover:bg-red-50 rounded-lg transition-all"
              title={t('delete')}
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            {['overview', 'animal', 'treatment', 'media', 'timeline'].map((tab) => (
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
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('animalIdName')}</p>
                      <p className="font-semibold text-foreground">{animalData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('animalType')}</p>
                      <p className="font-semibold text-foreground">{animalData.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('breed') || 'Breed'}</p>
                      <p className="font-semibold text-foreground">{animalData.breed}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('age')}</p>
                      <p className="font-semibold text-foreground">{animalData.age}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('gender')}</p>
                      <p className="font-semibold text-foreground">{animalData.gender}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No animal data available</p>
              )}
            </div>
          )}

          {/* Health Records Tab */}
          {activeTab === 'treatment' && (
            <div className="space-y-4">
              {healthRecords.length > 0 ? (
                healthRecords.map((record, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <p className="font-semibold text-foreground">{new Date(record.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.recordType}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('details')}</p>
                      <p className="text-foreground mb-4">{record.details}</p>
                      {record.diagnosis && (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
                          <p className="text-foreground mb-4">{record.diagnosis}</p>
                        </>
                      )}
                      {record.treatment && (
                        <>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{t('treatment')}</p>
                          <p className="text-foreground">{record.treatment}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-muted-foreground">
                  No health records available
                </div>
              )}
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Upload Section - Only for case owner */}
              {user?.id === caseData.farmerId && (
                <CaseMediaUpload
                  caseId={Number(caseId)}
                  onMediaUpload={(newMedia) => {
                    setMedia([...media, newMedia]);
                    toast.success('Media uploaded successfully');
                  }}
                  onError={(error) => {
                    toast.error(error);
                  }}
                />
              )}

              {/* Preview Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Media Gallery</h2>
                <CaseMediaPreview
                  media={media}
                  caseId={Number(caseId)}
                  canDelete={user?.id === caseData.farmerId}
                  onMediaDelete={(mediaId) => {
                    setMedia(media.filter((m) => m.id !== mediaId));
                    toast.success('Media deleted successfully');
                  }}
                  onError={(error) => {
                    toast.error(error);
                  }}
                />
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative">
                {healthRecords.length > 0 ? (
                  healthRecords.map((record, index) => (
                    <div key={index} className="flex gap-4 pb-8">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-green-600" />
                        {index < healthRecords.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className="font-semibold text-foreground">{new Date(record.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{record.details}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">
                    No timeline data available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-foreground mb-4">{t('deleteThisCase')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('deleteCaseConfirmMessage')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
