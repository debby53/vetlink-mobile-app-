import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, Filter, Eye, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { caseAPI, animalAPI, userAPI, CaseDTO, AnimalDTO, UserDTO } from '@/lib/apiService';
import { CustomAlert } from '@/components/CustomAlert';

export default function VeterinarianCases() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewCase, setShowNewCase] = useState(false);
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [sectorCases, setSectorCases] = useState<CaseDTO[]>([]);
  const [escalatedCases, setEscalatedCases] = useState<CaseDTO[]>([]);
  const [showSectorCases, setShowSectorCases] = useState(false);
  const [showEscalatedCases, setShowEscalatedCases] = useState(false);
  const [farmerMap, setFarmerMap] = useState<{ [key: number]: UserDTO }>({});
  const [animalMap, setAnimalMap] = useState<{ [key: number]: AnimalDTO }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setShowNewCase(true);
    }
  }, [location.search]);

  useEffect(() => {
    loadCases();
  }, [user?.id]);

  const loadCases = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Load cases assigned to this veterinarian
      const casesData = await caseAPI.getCasesByVeterinarianId(user.id);
      setCases(casesData);

      // Load cases in the same sector/location
      try {
        const sectorCasesData = await caseAPI.getCasesByVeterinarianLocation(user.id);
        // Filter to only show escalated cases in escalated view
        const escalatedCasesData = sectorCasesData.filter((c: CaseDTO) => c.isEscalated);
        setEscalatedCases(escalatedCasesData);
        
        // For sector cases, exclude escalated ones (they'll be shown separately)
        setSectorCases(sectorCasesData.filter((c: CaseDTO) => !c.isEscalated));
      } catch (err) {
        console.warn('Failed to load sector cases:', err);
        setSectorCases([]);
        setEscalatedCases([]);
      }

      // Combine all lists for data loading
      const allCases = [...casesData, ...sectorCases, ...escalatedCases];

      // Load farmer and animal details
      const farmers: { [key: number]: UserDTO } = {};
      const animals: { [key: number]: AnimalDTO } = {};

      for (const caze of allCases) {
        if (caze.farmerId && !farmers[caze.farmerId]) {
          try {
            const farmer = await userAPI.getUserById(caze.farmerId);
            farmers[caze.farmerId] = farmer;
          } catch (err) {
            console.error(`Failed to load farmer ${caze.farmerId}:`, err);
          }
        }
        if (caze.animalId && !animals[caze.animalId]) {
          try {
            const animal = await animalAPI.getAnimalById(caze.animalId);
            animals[caze.animalId] = animal;
          } catch (err) {
            console.error(`Failed to load animal ${caze.animalId}:`, err);
          }
        }
      }

      setFarmerMap(farmers);
      setAnimalMap(animals);
    } catch (err: any) {
      console.error('Failed to load cases:', err);
      setError(err.message || 'Failed to load cases');
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCase = async (caseId: number) => {
    setCaseToDelete(caseId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCase = async () => {
    if (!caseToDelete) return;
    try {
      await caseAPI.deleteCase(caseToDelete);
      setCases(cases.filter(c => c.id !== caseToDelete));
      setSectorCases(sectorCases.filter(c => c.id !== caseToDelete));
      setEscalatedCases(escalatedCases.filter(c => c.id !== caseToDelete));
      toast.success(t('caseDeleted') || 'Case deleted successfully');
      setShowDeleteConfirm(false);
      setCaseToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete case');
      setShowDeleteConfirm(false);
    }
  };

  const handleMarkAsReceived = async (caseId: number) => {
    try {
      const updatedCase = await caseAPI.markCaseAsReceived(caseId);
      setCases(cases.map(c => c.id === caseId ? updatedCase : c));
      setSectorCases(sectorCases.map(c => c.id === caseId ? updatedCase : c));
      toast.success('Case marked as received');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark case as received');
    }
  };

  const handleMarkAsCompleted = async (caseId: number) => {
    const diagnosis = prompt('Enter diagnosis:');
    if (!diagnosis) return;
    const treatment = prompt('Enter treatment:');
    if (!treatment) return;

    try {
      const updatedCase = await caseAPI.markCaseAsCompleted(caseId, { diagnosis, treatment });
      setCases(cases.map(c => c.id === caseId ? updatedCase : c));
      setSectorCases(sectorCases.map(c => c.id === caseId ? updatedCase : c));
      setEscalatedCases(escalatedCases.map(c => c.id === caseId ? updatedCase : c));
      toast.success('Case marked as completed and farmer notified');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark case as completed');
    }
  };

  const displayCases = showEscalatedCases ? escalatedCases : (showSectorCases ? sectorCases : cases);

  const filteredCases = displayCases.filter((c) => {
    const farmer = farmerMap[c.farmerId];
    const animal = animalMap[c.animalId];
    const matchesSearch =
      (farmer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t('caseManagement')}</h1>
            <p className="text-muted-foreground mt-1">{t('caseManagementSubtitle')}</p>
          </div>
        </div>

        {/* View Options */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setShowSectorCases(false);
              setShowEscalatedCases(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${!showSectorCases && !showEscalatedCases
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-foreground hover:bg-gray-300'
              }`}
          >
            My Assigned Cases ({cases.length})
          </button>
          <button
            onClick={() => {
              setShowSectorCases(true);
              setShowEscalatedCases(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${showSectorCases && !showEscalatedCases
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-foreground hover:bg-gray-300'
              }`}
          >
            Cases in My Sector ({sectorCases.length})
          </button>
          <button
            onClick={() => {
              setShowEscalatedCases(true);
              setShowSectorCases(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${showEscalatedCases
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-foreground hover:bg-gray-300'
              }`}
          >
            Escalated Cases ({escalatedCases.length})
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchPlaceholderCases')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'open', 'received', 'in_progress', 'completed', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? t('allCases') : status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-muted-foreground">{t('loading') || 'Loading cases...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Cases Table */}
        {!isLoading && filteredCases.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('caseId')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('farmer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('animal')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCases.map((c) => {
                    const farmer = farmerMap[c.farmerId];
                    const animal = animalMap[c.animalId];
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground text-sm">#{c.id}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{farmer?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{animal?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{c.caseType}</td>
                        <td className="px-6 py-4 text-sm">
                          {c.status === 'OPEN' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs">
                              <AlertCircle className="h-3 w-3" />
                              OPEN
                            </span>
                          )}
                          {c.status === 'RECEIVED' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                              <Clock className="h-3 w-3" />
                              RECEIVED
                            </span>
                          )}
                          {c.status === 'IN_PROGRESS' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-xs">
                              <Clock className="h-3 w-3" />
                              IN PROGRESS
                            </span>
                          )}
                          {c.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                              <CheckCircle className="h-3 w-3" />
                              COMPLETED
                            </span>
                          )}
                          {(c.status === 'RESOLVED' || c.status === 'CLOSED') && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold text-xs">
                              <CheckCircle className="h-3 w-3" />
                              {c.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {c.status === 'OPEN' && (
                            <button
                              onClick={() => handleMarkAsReceived(c.id!)}
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              Mark Received
                            </button>
                          )}
                          {(c.status === 'OPEN' || c.status === 'RECEIVED' || c.status === 'IN_PROGRESS') && (
                            <button
                              onClick={() => handleMarkAsCompleted(c.id!)}
                              className="text-green-600 font-semibold hover:underline"
                            >
                              Mark Completed
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/veterinarian/cases/${c.id}`)}
                            className="text-primary font-semibold hover:underline"
                          >
                            <Eye className="h-4 w-4 inline" /> View
                          </button>
                          <button
                            onClick={() => handleDeleteCase(c.id!)}
                            className="text-red-600 font-semibold hover:underline"
                          >
                            <Trash2 className="h-4 w-4 inline" /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && filteredCases.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-muted-foreground">{t('noCasesFound')}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <CustomAlert
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Case"
        description="Are you sure you want to delete this case? This action cannot be undone and will remove all associated data."
        icon={Trash2}
        iconColor="text-red-500"
        actionLabel="Delete"
        actionColor="bg-red-600 hover:bg-red-700"
        onAction={confirmDeleteCase}
        cancelLabel="Cancel"
        showCancel={true}
      />
    </SidebarLayout>
  );
}
